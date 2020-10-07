# coding = utf-8

# RegexExp on page: https://www.bjsubway.com/station/zjgls/
# <tr>[ \r\n]*<td>(?'fromStation'.*)<\/td>[ \r\n]*<td>(?'toStation'.*)<\/td>[ \r\n]*<td>(?'distance'.*)<\/td>[ \r\n]*<\/tr>

import json

with open("1100_drw_beijing.json", "r", encoding="utf-8") as f:
    dic = json.loads(f.read())

subwayStationDict = {}
subwayLineName2IDMapper = {}
subwayLineIDCnter = 0

for subwayLine in dic['l']:
    subwayLineName = subwayLine['ln']
    subwayLineName2IDMapper[subwayLineName] = subwayLineIDCnter
    subwayLineIDCnter += 1
    subwayStationDict[subwayLineName] = []
    print(subwayLine['ln'] + ": ", end="")
    for subwayStation in subwayLine['st']:
        subwayStationName = subwayStation['n']
        subwayStationDict[subwayLineName].append(subwayStationName)
        print(subwayStation['n'], end=",")
    print()

print(subwayStationDict)
print(subwayLineName2IDMapper)

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
subwayStationID2LineIDMapper = []

for lineName in subwayStationDict.keys():
    for subwayStationName in subwayStationDict[lineName]:
        if subwayStationName not in subwayStation2IDMapper:
            subwayStation2IDMapper[subwayStationName] = stationSize
            subwayID2StationMapper.append(subwayStationName)
            subwayStation2IDVisitedMapper[subwayStationName] = False
            subwayStationID2LineIDMapper.append([ subwayLineName2IDMapper[lineName] ])
            stationSize += 1
        else:
            subwayStationID2LineIDMapper[subwayStation2IDMapper[subwayStationName]].append(subwayLineName2IDMapper[lineName])

print(stationSize)
print(subwayStation2IDMapper)
print(subwayStationID2LineIDMapper)

for edge in subwayEdgeList:
    if edge[0] in subwayStation2IDMapper:
        subwayStation2IDVisitedMapper[edge[0]] = True
        edge[0] = subwayStation2IDMapper[edge[0]]
    else:
        print(edge[0] + "不在站点列表中！")
        subwayStation2IDMapper[edge[0]] = stationSize
        subwayID2StationMapper.append(edge[0])
        subwayStationID2LineIDMapper.append([int(input("请输入站点对应的线路ID:"))])
        stationSize += 1
        edge[0] = subwayStation2IDMapper[edge[0]]
    if edge[1] in subwayStation2IDMapper:
        subwayStation2IDVisitedMapper[edge[1]] = True
        edge[1] = subwayStation2IDMapper[edge[1]]
    else:
        print(edge[1] + "不在站点列表中！")
        subwayStation2IDMapper[edge[1]] = stationSize
        subwayID2StationMapper.append(edge[1])
        subwayStationID2LineIDMapper.append([int(input("请输入站点对应的线路ID:"))])
        stationSize += 1
        edge[1] = subwayStation2IDMapper[edge[1]]
print(subwayEdgeList)

for subwayStationName in subwayStation2IDVisitedMapper.keys():
    if subwayStation2IDVisitedMapper[subwayStationName] == False:
        print(subwayStationName + "没有边！")

output = {"subwayStation2IDMapper": subwayStation2IDMapper, "subwayID2StationMapper": subwayID2StationMapper,
          "subwayEdgeList": subwayEdgeList, "subwayLineName2IDMapper":subwayLineName2IDMapper, "subwayStationID2LineIDMapper":subwayStationID2LineIDMapper}
print(output)

with open("1100_dijkstra_beijing.json", "w") as f:
    f.write(json.dumps(output))
