var SSSP = {
    subwayEdgeList: null,
    subwayID2StationMapper: null,
    subwayStation2IDMapper: null,
    subwayEdge2DList: {},
    subwayLineName2IDMapper: null,
    subwayStationID2LineIDMapper: null,
    resultCache: null,

    init: function () {
        $.ajax({
            url: 'data/1100_dijkstra_beijing.json',
            type: "GET",
            data: '',
            dataType: "json",
            success: function (data) {
                SSSP.subwayEdgeList = data.subwayEdgeList;
                SSSP.subwayID2StationMapper = data.subwayID2StationMapper;
                SSSP.subwayStation2IDMapper = data.subwayStation2IDMapper;
                SSSP.subwayLineName2IDMapper = data.subwayLineName2IDMapper;
                SSSP.subwayStationID2LineIDMapper = data.subwayStationID2LineIDMapper;
                for (let i = 0; i < SSSP.subwayEdgeList.length; i++) {
                    if (SSSP.subwayEdge2DList[SSSP.subwayEdgeList[i][0]] === undefined)
                        SSSP.subwayEdge2DList[SSSP.subwayEdgeList[i][0]] = [];
                    SSSP.subwayEdge2DList[SSSP.subwayEdgeList[i][0]].push(SSSP.subwayEdgeList[i]);
                }
                console.log(SSSP);
            }
        });
    },

    getPriority: function (w) {
        return 1000000000 - w;
    },

    dijkstra: function (fromStationID, toStationID) {
        const TRANSFER_PENALTY = 2000;
        var pq = new PriorityQueue();
        var dis = [];
        var visited = [];
        var prev = [];
        //Init
        for (let i = 0; i < SSSP.subwayID2StationMapper.length; i++) {
            dis[i] = 1000000000;
            visited[i] = {};
            for (let j = 0; j < SSSP.subwayStationID2LineIDMapper[i].length; j++) {
                visited[i][SSSP.subwayStationID2LineIDMapper[i][j]] = false;
            }
            prev[i] = -1;
        }
        let curStationLineIDs = SSSP.subwayStationID2LineIDMapper[fromStationID];
        for (let i = 0; i < curStationLineIDs.length; i++) {
            pq.enqueue(SSSP.getPriority(0), {
                fromStationID: fromStationID,
                distance: 0,
                previousNodeID: -1,
                fromStationLineID: curStationLineIDs[i]
            });
        }

        while (pq.getLength() !== 0) {
            let node = pq.dequeue();
            if (visited[node.fromStationID][node.fromStationLineID] === true) continue;
            visited[node.fromStationID][node.fromStationLineID] = true;
            if (node.distance >= dis[node.fromStationID]) continue;
            dis[node.fromStationID] = node.distance;
            prev[node.fromStationID] = node.previousNodeID;
            let edgeList = SSSP.subwayEdge2DList[node.fromStationID];
            for (let i = 0; i < edgeList.length; i++) {
                let curStationLineIDs = SSSP.subwayStationID2LineIDMapper[edgeList[i][1]];
                for (let j = 0; j < curStationLineIDs.length; j++) {
                    if (visited[edgeList[i][1]][curStationLineIDs[j]] === false) {
                        let nodeDist = dis[node.fromStationID] + edgeList[i][2];
                        if (node.fromStationLineID !== curStationLineIDs[j]) nodeDist += TRANSFER_PENALTY;
                        pq.enqueue(SSSP.getPriority(nodeDist), {
                            fromStationID: edgeList[i][1],
                            distance: nodeDist,
                            previousNodeID: node.fromStationID,
                            fromStationLineID: curStationLineIDs[j]
                        });
                    }
                }

            }
        }
        var path = [];
        var curStation = toStationID;
        while (curStation !== -1) {
            path.push(curStation);
            curStation = prev[curStation];
        }
        return {
            dist: dis[toStationID],
            path: path
        };
    },

    getTicketPrice: function (distance) {
        if (distance <= 6000) return 3;
        else if (distance <= 12000) return 4;
        else if (distance <= 22000) return 5;
        else if (distance <= 32000) return 6;
        else return 6 + Math.ceil((distance - 32000) / 20000);
    },

    query: function (fromStationName, toStationName) {
        var fromStationID = SSSP.subwayStation2IDMapper[fromStationName];
        if (fromStationID === undefined) {
            alert("系统中不存在该始发站！");
            return;
        }
        var toStationID = SSSP.subwayStation2IDMapper[toStationName];
        if (toStationID === undefined) {
            alert("系统中不存在该终到站！");
            return;
        }
        SSSP.sendData(fromStationName, toStationName);
        SSSP.clearHighLightStationLine();
        var result = SSSP.dijkstra(fromStationID, toStationID);
        var dist = 0;
        for (let i = 0; i < result.path.length; i++) {
            if (i !== result.path.length - 1) {
                for (let j = 0; j < SSSP.subwayEdge2DList[result.path[i]].length; j++) {
                    if (SSSP.subwayEdge2DList[result.path[i]][j][1] === result.path[i + 1])
                        dist += SSSP.subwayEdge2DList[result.path[i]][j][2];
                }
            }
            result.path[i] = SSSP.subwayID2StationMapper[result.path[i]];
            d3.select("#svg-g").selectAll("text[name='" + result.path[i] + "']").attr("stroke", "red");
        }
        result.dist = dist;
        console.log(result);
        SSSP.resultCache = result;
        SSSP.drawHighLightStationLine();
        $("#query-info").text("从" + fromStationName + "到" + toStationName + "，里程" + dist.toString() + "米，票价" + SSSP.getTicketPrice(dist) + "元。");
    },

    drawHighLightStationLine: function () {
        var path = [];
        var cachePath = SSSP.resultCache.path;
        for (var i = 0; i < cachePath.length; i++) {
            var stationNode = d3.select("#g-station").select("circle[name=" + cachePath[i] + "]");
            if (stationNode[0][0] !== null) {
                var X = stationNode.attr("cx");
                var Y = stationNode.attr("cy");
                path.push([X, Y]);
            }
        }
        var lineFunction_line = d3.svg.line().interpolate("linear");
        var select_line = d3.select("#g-line")
            .append("path")
            .attr("id", "highlighted-station-line")
            .attr("name", "highlighted-station-line")
            .attr("stroke", "#ff00ff")
            .attr("d", lineFunction_line(path));
    },

    clearHighLightStationLine: function () {
        d3.select("#highlighted-station-line").remove();
    },

    sendData: function (fromStationName, toStationName) {
        $.ajax({
            url: 'api/store.php',
            type: "GET",
            data: {
                fromStation: fromStationName,
                toStation: toStationName
            }
        });
    }

}