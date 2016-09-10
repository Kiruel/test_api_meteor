import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Articles = new Mongo.Collection('articles');

if(Meteor.isServer) {
  Meteor.startup(function () {
    // Global configuration
    Api = new Restivus({
      version: 'v1',
      useDefaultAuth: true,
      prettyJson: true
    });

    Api.addCollection(Meteor.users);

    Api.addRoute('articles/:id', {authRequired: true}, {
      post: {
        action: function () {
          var article = Articles.insert({_id: this.urlParams.id, data: this.bodyParams});
          if (article) {
            return {status: "success", data: article};
          }
          return {
            statusCode: 400,
            body: {status: "fail", message: "Unable to add article"}
          };
        }
      },
      get: {
        action: function () {
          return Articles.findOne(this.urlParams.id);
        }
      },
      delete: {
        roleRequired: ['author', 'admin'],
        action: function () {
          if (Articles.remove(this.urlParams.id)) {
            return {status: 'success', data: {message: 'Article removed'}};
          }
          return {
            statusCode: 404,
            body: {status: 'fail', message: 'Article not found'}
          };
        }
      }
    });

    Api.addRoute('test_data', {authRequired: true}, {
      get: function () {
        return {status: "success", data: {data1: "testtt"}};
      }
    });

    Api.addRoute('articles', {authRequired: true}, {
      get: function () {
        var articles = Articles.find().fetch();
        return {status: "success", data: articles};
      }
    });
  });
}

