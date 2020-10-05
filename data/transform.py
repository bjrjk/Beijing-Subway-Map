# coding = utf-8

# RegexExp on page: https://www.bjsubway.com/station/zjgls/
# <tr>[ \r\n]*<td>(?'fromStation'.*)<\/td>[ \r\n]*<td>(?'toStation'.*)<\/td>[ \r\n]*<td>(?'distance'.*)<\/td>[ \r\n]*<\/tr>

import json

with open("1100_drw_beijing.json", "r", encoding="utf-8") as f:
    dic = json.loads(f.read())

subwayStationDict = {}

for subwayLine in dic['l']:
    subwayLineName = subwayLine['ln']
    subwayStationDict[subwayLineName] = []
    print(subwayLine['ln'] + ": ", end="")
    for subwayStation in subwayLine['st']:
        subwayStationName = subwayStation['n']
        subwayStationDict[subwayLineName].append(subwayStationName)
        print(subwayStation['n'], end=",")
    print()

print(subwayStationDict)

subwayEdgeList = []
with open("1100_edge_beijing.txt", "r", encoding="utf-8") as f:
    for line in f.readlines():
        curEdge = line.split()
        curEdge[2] = int(curEdge[2])
        subwayEdgeList.append(curEdge)

print(subwayEdgeList)

subwayStation2IDMapper = {}
subwayID2StationMapper = []
subwayStation2IDVisitedMapper = {}
stationSize = 0

for lineName in subwayStationDict.keys():
    for subwayStationName in subwayStationDict[lineName]:
        if subwayStationName not in subwayStation2IDMapper:
            subwayStation2IDMapper[subwayStationName] = stationSize
            subwayID2StationMapper.append(subwayStationName)
            subwayStation2IDVisitedMapper[subwayStationName] = False
            stationSize += 1

print(stationSize)
print(subwayStation2IDMapper)

for edge in subwayEdgeList:
    if edge[0] in subwayStation2IDMapper:
        subwayStation2IDVisitedMapper[edge[0]] = True
        edge[0] = subwayStation2IDMapper[edge[0]]
    else:
        print(edge[0] + "不在站点列表中！")
        subwayStation2IDMapper[edge[0]] = stationSize
        subwayID2StationMapper.append(edge[0])
        stationSize += 1
        edge[0] = subwayStation2IDMapper[edge[0]]
    if edge[1] in subwayStation2IDMapper:
        subwayStation2IDVisitedMapper[edge[1]] = True
        edge[1] = subwayStation2IDMapper[edge[1]]
    else:
        print(edge[1] + "不在站点列表中！")
        subwayStation2IDMapper[edge[1]] = stationSize
        subwayID2StationMapper.append(edge[1])
        stationSize += 1
        edge[1] = subwayStation2IDMapper[edge[1]]
print(subwayEdgeList)

for subwayStationName in subwayStation2IDVisitedMapper.keys():
    if subwayStation2IDVisitedMapper[subwayStationName] == False:
        print(subwayStationName + "没有边！")

output = {"subwayStation2IDMapper": subwayStation2IDMapper, "subwayID2StationMapper": subwayID2StationMapper,
          "subwayEdgeList": subwayEdgeList}
print(output)

with open("1100_dijkstra_beijing.json", "w") as f:
    f.write(json.dumps(output))
