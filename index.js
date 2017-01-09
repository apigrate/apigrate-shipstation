var request = require('request');
var _ = require('lodash');
var Q = require('q');

/**
  ShipStation API wrapper.
*/
function ShipStation(apiKey, apiSecret) {
  this.baseRequest = request.defaults({
      method: 'GET',
      baseUrl: 'https://ssapi.shipstation.com/',
      headers: {
        'Authorization': 'Basic ' + new Buffer(apiKey + ":" + apiSecret).toString('base64')
    }
  });
}

ShipStation.prototype._formatQueryString = function(queryObj){
  var qString = '';
  _.each(queryObj,function(obj,key){
    if(qString!==''){
      qString += '&';
    }
    qString += encodeURIComponent(key) + '='+ encodeURIComponent(obj);
  });

  if(qString!==''){
    qString = '?'+qString;
  }
  return qString;
};

ShipStation.prototype.getOrder = function(id){
  var deferred = Q.defer();
  this.baseRequest.get('/orders/'+ id, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listOrders = function(queryObj){
  var deferred = Q.defer();
  var qString = this._formatQueryString(queryObj);
  this.baseRequest.get('/orders/'+ qString, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listTags = function(){
  var deferred = Q.defer();
  this.baseRequest.get('/accounts/listtags', {json: true}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};


ShipStation.prototype.listOrdersTaggedWith = function(orderStatus, tagId){
  var queryObj = {"orderStatus":orderStatus, "tagId": tagId};
  var deferred = Q.defer();
  var qString = this._formatQueryString(queryObj);
  this.baseRequest.get('orders/listbytag'+ qString, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

/**
  @param orderId
  @param carrierCode
  @param shipDate in YYYY-MM-DD format
  @param trackingNumber
  @param notifyCustomer
  @param notifySalesChannel
*/
ShipStation.prototype.markOrderAsShipped = function(orderId, carrierCode,
  shipDate, trackingNumber, notifyCustomer, notifySalesChannel ){
  var deferred = Q.defer();
  var payload =  {
    "orderId": orderId,
  };
  if(!_.isNil(carrierCode)){
    payload.carrierCode = carrierCode;
  }
  if(!_.isNil(shipDate)){
    payload.shipDate = shipDate;
  }
  if(!_.isNil(trackingNumber)){
    payload.trackingNumber = trackingNumber;
  }
  if(!_.isNil(notifyCustomer)){
    payload.notifyCustomer = notifyCustomer;
  }
  if(!_.isNil(notifySalesChannel)){
    payload.notifySalesChannel = notifySalesChannel;
  }

  this.baseRequest.post({url: 'orders/markasshipped',
    json: true, body: payload}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.tagOrder = function(orderId, tagId){
  var deferred = Q.defer();
  var payload={
    "orderId": orderId,
    "tagId": tagId
  };
  this.baseRequest.post({url: 'orders/addtag',
    json: true, body: payload}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.untagOrder = function(orderId, tagId){
  var deferred = Q.defer();
  var payload={
    "orderId": orderId,
    "tagId": tagId
  };
  this.baseRequest.post({url: 'orders/removetag',
    json: true, body: payload}, function(error, response, body){
    if(_.isNil(error)){
      deferred.resolve(body);
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

module.exports=ShipStation;
