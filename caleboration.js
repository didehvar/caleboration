
People = new Meteor.Collection("people");
Days = new Meteor.Collection("days");

if (Meteor.isClient) {
  Template.calRows.rows = function() {
    return Days.find({});
  }

  Template.calCells.days = function() {
    var arr = Days.findOne({ rowId: this.rowId });
    var result = [];

    for (var key in arr) {
      if (key >= 0 && key <= 50) {
        result.push(arr[key]);
      }
    }

    return result;
  }

  Template.calCellDay.events({
    'click td': function() {
      if (this.status === 'success') {
        // change to danger
        console.log('changing');
        console.log(this);
        console.log(Days.find({ date: this.date }).fetch());
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function() {
    Days.remove({});
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
          row[j] = { date: day.format('Do MMMM'), status: 'success' };

          if (dayCount % 7 === 0) {
            row['rowId'] = count++;
            Days.insert(row);
            row = {};
          }

          dayCount++;
        }
      }
    }
  });
}
