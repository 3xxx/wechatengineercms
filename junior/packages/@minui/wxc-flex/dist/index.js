'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Component({
  behaviors: [],
  properties: {
    // 主轴方向
    dir: {
      type: String,
      value: 'left'
    },
    // 主轴对齐方式
    main: {
      type: String,
      value: 'left'
    },
    // 交叉轴对齐方式
    cross: {
      type: String,
      value: 'stretch'
    },
    // 换行设置
    wrap: {
      type: String,
      value: 'nowrap'
    }
  },
  data: {},
  methods: {
    onClick: function onClick(event) {
      var detail = event.detail;
      var option = {};
      this.triggerEvent('click', detail, option);
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4Lnd4YyJdLCJuYW1lcyI6WyJiZWhhdmlvcnMiLCJwcm9wZXJ0aWVzIiwiZGlyIiwidHlwZSIsIlN0cmluZyIsInZhbHVlIiwibWFpbiIsImNyb3NzIiwid3JhcCIsImRhdGEiLCJtZXRob2RzIiwib25DbGljayIsImV2ZW50IiwiZGV0YWlsIiwib3B0aW9uIiwidHJpZ2dlckV2ZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFJSUEsYUFBVyxFO0FBQ1hDLGNBQVk7QUFDVjtBQUNBQyxTQUFLO0FBQ0hDLFlBQU1DLE1BREg7QUFFSEMsYUFBTztBQUZKLEtBRks7QUFNVjtBQUNBQyxVQUFNO0FBQ0pILFlBQU1DLE1BREY7QUFFSkMsYUFBTztBQUZILEtBUEk7QUFXVjtBQUNBRSxXQUFPO0FBQ0xKLFlBQU1DLE1BREQ7QUFFTEMsYUFBTztBQUZGLEtBWkc7QUFnQlY7QUFDQUcsVUFBTTtBQUNKTCxZQUFNQyxNQURGO0FBRUpDLGFBQU87QUFGSDtBQWpCSSxHO0FBc0JaSSxRQUFNLEU7QUFDTkMsV0FBUztBQUNQQyxXQURPLG1CQUNDQyxLQURELEVBQ1E7QUFDYixVQUFJQyxTQUFTRCxNQUFNQyxNQUFuQjtBQUNBLFVBQUlDLFNBQVMsRUFBYjtBQUNBLFdBQUtDLFlBQUwsQ0FBa0IsT0FBbEIsRUFBMkJGLE1BQTNCLEVBQW1DQyxNQUFuQztBQUNEO0FBTE0iLCJmaWxlIjoiaW5kZXgud3hjIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICAgIGNvbmZpZzoge1xuICAgICAgdXNpbmdDb21wb25lbnRzOiB7fVxuICAgIH0sXG4gICAgYmVoYXZpb3JzOiBbXSxcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAvLyDkuLvovbTmlrnlkJFcbiAgICAgIGRpcjoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAnbGVmdCdcbiAgICAgIH0sXG4gICAgICAvLyDkuLvovbTlr7npvZDmlrnlvI9cbiAgICAgIG1haW46IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ2xlZnQnXG4gICAgICB9LFxuICAgICAgLy8g5Lqk5Y+J6L205a+56b2Q5pa55byPXG4gICAgICBjcm9zczoge1xuICAgICAgICB0eXBlOiBTdHJpbmcsXG4gICAgICAgIHZhbHVlOiAnc3RyZXRjaCdcbiAgICAgIH0sXG4gICAgICAvLyDmjaLooYzorr7nva5cbiAgICAgIHdyYXA6IHtcbiAgICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgICB2YWx1ZTogJ25vd3JhcCdcbiAgICAgIH1cbiAgICB9LFxuICAgIGRhdGE6IHt9LFxuICAgIG1ldGhvZHM6IHtcbiAgICAgIG9uQ2xpY2soZXZlbnQpIHtcbiAgICAgICAgbGV0IGRldGFpbCA9IGV2ZW50LmRldGFpbDtcbiAgICAgICAgbGV0IG9wdGlvbiA9IHt9O1xuICAgICAgICB0aGlzLnRyaWdnZXJFdmVudCgnY2xpY2snLCBkZXRhaWwsIG9wdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9Il19