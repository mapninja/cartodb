var Backbone = require('backbone');
var TorqueHeaderView = require('../../../src/widgets/time-series/torque-header-view');

describe('widgets/time-series/torque-header-view', function () {
  var filterIsEmpty = true;

  beforeEach(function () {
    this.selectionTotal = new Backbone.Model({ total: 0 });
    this.dataviewModel = new Backbone.Model({
      data: [
        { bin: 0, start: 1, end: 2, freq: 1, min: 1, max: 1, avg: 1 },
        { bin: 1, start: 2, end: 3, freq: 1, min: 2, max: 3, avg: 4 }
      ]
    });
    this.dataviewModel.layer = new Backbone.Model();
    this.dataviewModel.filter = new Backbone.Model();
    this.dataviewModel.filter.isEmpty = function () {
      return filterIsEmpty;
    };
    this.torqueLayerModel = new Backbone.Model();
    this.view = new TorqueHeaderView({
      selectionTotal: this.selectionTotal,
      dataviewModel: this.dataviewModel,
      torqueLayerModel: this.torqueLayerModel
    });
  });

  afterEach(function () {
    filterIsEmpty = true;
  });

  describe('.render', function () {
    it('should render the proper template', function () {
      this.view.render();

      expect(this.view.$('.js-torque-controls').length).toBe(1);
      expect(this.view.$('.js-time-series-header').length).toBe(1);
    });

    it('should render torque controls and hide clear button if filter is empty', function () {
      this.view.render();

      // Torque controls rendered
      expect(this.view.$('.CDB-Widget-controlButtonContent').length).toBe(1);
      // Torque time info rendered
      expect(this.view.$('.CDB-Widget-timeSeriesTimeInfo').length).toBe(1);
      // Header clear button not present
      expect(this.view.$('.js-clear').length).toBe(0);
    });

    it('should not render torque controls and show clear button if filter has value', function () {
      filterIsEmpty = false;
      this.dataviewModel.filter.set({ min: 1, max: 2 });

      this.view.render();

      // Torque controls not rendered
      expect(this.view.$('.CDB-Widget-controlButtonContent').length).toBe(0);
      // Torque time info not rendered
      expect(this.view.$('.CDB-Widget-timeSeriesTimeInfo').length).toBe(0);
      // Header clear button present
      expect(this.view.$('.js-clear').length).toBe(1);
    });
  });
});
