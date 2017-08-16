//Version 1.0.11
var request = _rqr('request');
var _ = _rqr('lodash');
var Q = _rqr('q');

// -----------------------------------------------------------------------------
/* for nodejs + builtio */
function _rqr(lib){ return typeof $require != 'undefined' ? $require(lib) : require(lib); }
function _exp(constr){ if(typeof $export != 'undefined'){ $export(null, constr); } else { module.exports=constr; } }

// -----------------------------------------------------------------------------
var LOGGER = null;

/**
  ShipStation API wrapper.
  @param apiKey
  @param apiSecret
  @param logger (optional) Apigrate Logger instance (default INFO level to console)
*/
function ShipStation(apiKey, apiSecret, logger) {
  this.baseRequest = request.defaults({
      method: 'GET',
      baseUrl: 'https://ssapi.shipstation.com/',
      headers: {
        'Authorization': 'Basic ' + new Buffer(apiKey + ":" + apiSecret).toString('base64')
      }
  });
  if(!_.isNil(logger)){
    LOGGER = logger;
  } else {
    LOGGER = { ERROR:console.error, WARN:console.error, INFO:console.info, DEBUG:console.log, TRACE:console.log };
  }
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

ShipStation.prototype.createWarehouse = function(toSave){
  var deferred = Q.defer();
  var payload=toSave;
  this.baseRequest.post({url: 'warehouses/createwarehouse',
    json: true, body: payload}, function(error, response, body){
    if(_.isNil(error)){
      if(response.statusCode==200 || response.statusCode==201){
        deferred.resolve(body);
      } else {
        deferred.reject( new Error("createwarehouse error. " + response.body.Message + ' Details:\n' + JSON.stringify(response.body) ) );
      }
    } else {
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.getOrder = function(id){
  var deferred = Q.defer();
  this.baseRequest.get('/orders/'+ id, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
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
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listShipments = function(queryObj){
  var deferred = Q.defer();
  var qString = this._formatQueryString(queryObj);
  this.baseRequest.get('/shipments/'+ qString, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listTags = function(){
  var deferred = Q.defer();
  this.baseRequest.get('/accounts/listtags', {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listOrdersTaggedWith = function(orderStatus, tagId){
  LOGGER.DEBUG('Listing orders targged with status "'+orderStatus+'", tag id '+ tagId);
  var queryObj = {"orderStatus":orderStatus, "tagId": tagId};
  var deferred = Q.defer();
  var qString = this._formatQueryString(queryObj);
  this.baseRequest.get('orders/listbytag'+ qString, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.listWarehouses = function(queryObj){
  var deferred = Q.defer();
  var qString = this._formatQueryString(queryObj);
  this.baseRequest.get('/warehouses/'+ qString, {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
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
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};
/**
  Saves (creates or updates) an order.
  If the orderKey is specified, the method becomes idempotent and the
  existing order with that key will be updated. Note: Only orders in an open
  status in ShipStation (awaiting_payment,awaiting_shipment, and on_hold) can be
  updated through this method.
  @param toSave the order payload (see: http://www.shipstation.com/developer-api/#/reference/orders/createupdate-order/create/update-order )
*/
ShipStation.prototype.saveOrder = function(toSave){
  var deferred = Q.defer();
  var payload=toSave;
  this.baseRequest.post({url: 'orders/createorder',
    json: true, body: payload}, function(error, response, body){
      if(_.isNil(error)){
        if(response.statusCode==200 || response.statusCode==201){
          deferred.resolve(body);
        } else {
          deferred.reject( new Error("createorder error. " + response.body.Message + ' Details:\n' + JSON.stringify(response.body) ) );
        }
      } else {
        deferred.reject(error);
      }
  });
  return deferred.promise;
};

ShipStation.prototype.listWebhooks = function(){
  var deferred = Q.defer();
  this.baseRequest.get('webhooks', {json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

/**
  @param webhookInfo
  @example {
  "target_url": "http://someexamplewebhookurl.com/neworder",
  "event": "ORDER_NOTIFY",
  "store_id": null,
  "friendly_name": "My Webhook"
 }
*/
ShipStation.prototype.subscribeWebhook = function(webhookInfo){
  var deferred = Q.defer();
  var payload=webhookInfo;
  this.baseRequest.post({url: 'webhooks/subscribe',
    json: true, body: payload}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

ShipStation.prototype.unsubscribeWebhook = function(webhookId){
  var deferred = Q.defer();
  this.baseRequest.delete({url: 'webhooks/'+webhookId,
    json: true}, function(error, response, body){
    if(_.isNil(error)){
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
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
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
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
      LOGGER.TRACE("ShipStation raw response: " + JSON.stringify(body));
      deferred.resolve(body);
    } else {
      LOGGER.ERROR("ShipStation error: " + JSON.stringify(error));
      deferred.reject(error);
    }
  });
  return deferred.promise;
};

_exp(ShipStation);
