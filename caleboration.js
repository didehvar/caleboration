
People = new Meteor.Collection("people");
Days = new Meteor.Collection("days");

if (Meteor.isClient) {
  var indexOf = function(needle) {
    if (typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
      indexOf = function(needle) {
        var i = -1, index = -1;
        for(i = 0; i < this.length; i++) {
          if(this[i] === needle) {
            index = i;
            break;
          }
        }
        return index;
      };
    }
    return indexOf.call(this, needle);
  };

  Template.calRows.rows = function() {
    var allDays = Days.find({}, { sort: { order: 1 } }).fetch();
    var rowArray = [];
    var chunk = 7;

    var i, j;

    for (i = 0, j = allDays.length; i < j; i += chunk) {
      rowArray.push(allDays.slice(i, i + chunk));
    }

    return rowArray;
  }

  Template.calCells.days = function() {
    return this;
  }

  Template.calCellDay.events({
    'click td': function() {
      var firstname = $('#firstname').val().trim();

      if (!firstname || firstname.length === 0) {
        $('#firstname').parent().addClass('has-error');
        return;
      }

      if (this.status === 'success') {
        // change to danger
        Days.update({ _id: this._id }, {
          $set: { status: 'danger' },
          $push: { failures: firstname }
        });
      } else {
        // possible circumstances:
        // this person is unavailable
        // this person is available, one or more other people are unavailable
        // both this person and one or mother other people are unavailable
        // check which!

        var datas = Days.findOne({ _id: this._id });

        // no one is unavailable
        if (!datas.failures || datas.failures.length === 0) {
          return Days.update({ _id: this._id }, {
            $set: { status: 'success' }
          });
        }

        // this person is the only unavailable person
        if (datas.failures.length === 1 && datas.failures[0] === firstname) {
          return Days.update({ _id: this._id }, {
            $set: { status: 'success' },
            $pull: { failures: firstname }
          });
        }

        // this person is available, others are unavailable
        if (datas.failures.length > 0 && indexOf.call(datas.failures, firstname) < 0) {
          return Days.update({ _id: this._id }, {
            $push: { failures: firstname }
          });
        }

        // both this person and other(s) are unavailable
        if (datas.failures.length > 1 && indexOf.call(datas.failures, firstname) >= 0) {
          return Days.update({ _id: this._id }, {
            $pull: { failures: firstname }
          });
        }
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    //Days.remove({});
    if (Days.find({}).count() === 0)
    {
      var months = 3;
      var startMonth = 7;
      var count = 0;
      var dayCount = 1;
      var row = {};

      for (var i = 0; i < months; i++) {
        var currentMonth = startMonth + i;
        var month = moment("2014-" + ('0' + currentMonth).slice(-2), 'YYYY-MM');

        for (var j = 0; j < month.daysInMonth(); j++) {
          var day = month.clone().add('d', j);
          Days.insert({
            order: count++,
            date: day.format('Do MMMM'),
            status: 'success'
          });
        }
      }
    }
  });
}
