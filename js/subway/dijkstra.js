var SSSP={
    subwayEdgeList: null,
    subwayID2StationMapper: null,
    subwayStation2IDMapper: null,

    init: function(){
        $.ajax({
            // url: requestUrl,
            url: 'data/1100_dijkstra_beijing.json',
            type: "GET",
            data: '',
            dataType: "json",
            success: function (data) {
                SSSP.subwayEdgeList = data.subwayEdgeList;
                SSSP.subwayID2StationMapper = data.subwayID2StationMapper;
                SSSP.subwayStation2IDMapper = data.subwayStation2IDMapper;

                console.log(data);
            }
        });
    }
}