
#insert - post
curl -X POST "http://localhost:8000/dictionary" -H "accept: */*" -H "Content-Type: application/json" -d "{\"payload\":{\"key\":\"20191406-0002\",\"value\":\"20191006-0001\",\"description\":\"testdata\"}}"


#insert - post
curl -X DELETE "http://localhost:8000/dictionary" -H "accept: */*" -H "Content-Type: application/json" -d "{\"payload\":{\"key\":\"20191406-0002\",\"value\":\"20191006-0001\",\"description\":\"testdata\"}}"

#find - get
#http://localhost:8000/dictionary/{"payload":{"createdAt":"2019-10-06T14:20:10.710Z","updatedAt":"2019-10-06T14:20:10.710Z","_id":"5d99f81a508f4e04bb76761b","_schemaVersion":"0001","_docVersionKey":"0"}}


