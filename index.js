/*
  Copyright 2018 Apigrate, LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
var request = require('request');
var _ = require('lodash');

/**
  NodeJS ShipStation API connector. Make promise-based API calls to the ShipStation API.
  @param apiKey
  @param apiSecret
  @param logger (optional) Logger instance (winston style logging). If omitted,
  error and warnings will be output to console.

  @version 2.3.0
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
    this.LOGGER = logger;
  } else {
    this.LOGGER = { error: console.error, warn: console.error, info: function(){}, debug: function(){}, silly: function(){}};
  }
}

// Orders ......................................................................

ShipStation.prototype.getOrder = function(id){
  return this._get('orders/'+ encodeURIComponent(id));
};

ShipStation.prototype.listOrders = function(queryObj){
  return this._get('orders/', queryObj);
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
  return this._post('orders/createorder', toSave);
};

/** @see https://www.shipstation.com/developer-api/#/reference/orders/create-label-for-order/create-label-for-order */
ShipStation.prototype.createLabelForOrder = function(labelInfo){
  return this._post('orders/createlabelfororder', labelInfo);
};

/**
  @param orderId
  @param carrierCode
  @param shipDate in YYYY-MM-DD format
  @param trackingNumber
  @param notifyCustomer
  @param notifySalesChannel
  @see https://www.shipstation.com/developer-api/#/reference/orders/mark-an-order-as-shipped/mark-an-order-as-shipped
*/
ShipStation.prototype.markOrderAsShipped = function(orderId, carrierCode,
  shipDate, trackingNumber, notifyCustomer, notifySalesChannel ){
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
  return this._post('orders/markasshipped', payload);
};


ShipStation.prototype.listOrdersTaggedWith = function(orderStatus, tagId){
  this.LOGGER.debug('Listing orders targged with status "'+orderStatus+'", tag id '+ tagId);
  return this._get('orders/listbytag', {"orderStatus":orderStatus, "tagId": tagId});
};

ShipStation.prototype.tagOrder = function(orderId, tagId){
  var payload={
    "orderId": orderId,
    "tagId": tagId
  };
  return this._post('orders/addtag', payload);
};

ShipStation.prototype.untagOrder = function(orderId, tagId){
  var payload={
    "orderId": orderId,
    "tagId": tagId
  };
  return this._post('orders/removetag', payload);
};

/**
  @param orderId
  @param holdUntilDate in YYYY-MM-DD format
  @see https://shipstation.docs.apiary.io/#reference/orders/hold-order-until/hold-order-until
*/
ShipStation.prototype.holdOrderUntil = function(orderId, holdUntilDate){
  var payload={
    "orderId": orderId,
    "holdUntilDate": holdUntilDate
  };
  return this._post('orders/holduntil', payload);
};

// Shipments ...................................................................

ShipStation.prototype.listShipments = function(queryObj){
  return this._get('shipments/', queryObj);
};

ShipStation.prototype.getRates = function(queryObj){
  return this._post('shipments/getrates', queryObj);
};

/** @see https://www.shipstation.com/developer-api/#/reference/shipments/create-shipment-label/create-shipment-label */
ShipStation.prototype.createShipmentLabel = function(labelObj){
  return this._post('shipments/createlabel', labelObj);
};

/** @see https://www.shipstation.com/developer-api/#/reference/shipments/void-label/void-label */
ShipStation.prototype.voidLabel = function(shipmentId){
  return this._post('shipments/voidlabel', {shipmentId: shipmentId});
};

// Fulfillments (a.k.a. manually shipped shipments) ............................
ShipStation.prototype.listFulfillments = function(queryObj){
  return this._get('fulfillments/', queryObj);
};

// Tags ........................................................................

ShipStation.prototype.listTags = function(){
  return this._get('accounts/listtags');
};

// Warehouses ..................................................................

ShipStation.prototype.listWarehouses = function(queryObj){
  return this._get('warehouses/', queryObj);
};

ShipStation.prototype.createWarehouse = function(toSave){
  return this._post('warehouses/createwarehouse', toSave);
};

// Carriers, Services, Packages ................................................
ShipStation.prototype.listCarriers = function(){
  return this._get('carriers');
};

ShipStation.prototype.listPackagesByCarrier = function(carrierCode){
  return this._get('carriers/listpackages', { carrierCode : carrierCode });
};

ShipStation.prototype.listServicesByCarrier = function(carrierCode){
  return this._get('carriers/listservices', { carrierCode : carrierCode });
};


// Webhooks ....................................................................

ShipStation.prototype.listWebhooks = function(){
  return this._get('webhooks');
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
  return this._post('webhooks/subscribe', webhookInfo);
};

ShipStation.prototype.unsubscribeWebhook = function(webhookId){
  return this._delete('webhooks/'+webhookId);
};


// internal HTTP methods .......................................................

ShipStation.prototype._get = function(url, queryStringOb){
  var self = this;
  return new Promise(function(resolve, reject){
    var opts = {url: url,  json: true};
    if(queryStringOb){
      opts.qs = queryStringOb;
    }
    self.baseRequest.get(opts, function(error, response, body){
      if(_.isNil(error)){
        self.LOGGER.silly("ShipStation raw response: " + JSON.stringify(body));
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

ShipStation.prototype._post = function(url, payload){
  var self = this;
  return new Promise(function(resolve, reject){
    self.baseRequest.post({url: url,
      json: true, body: payload}, function(error, response, body){
      if (!_.isNil(error)){
        reject(error);
      } else if(response.statusCode==200 || response.statusCode==201){
        self.LOGGER.silly("ShipStation raw response: " + JSON.stringify(body));
        resolve(body);
      } else {
        self.LOGGER.silly("ShipStation raw response: " + JSON.stringify(body));
        reject(new Error('Error (code='+response.statusCode+') ' + body));
      }
    });
  });
};

ShipStation.prototype._delete = function(url){
  var self = this;
  return new Promise(function(resolve, reject){
    self.baseRequest.delete({url: url,
      json: true}, function(error, response, body){
      if(_.isNil(error)){
        self.LOGGER.silly("ShipStation raw response: " + JSON.stringify(body));
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
};


module.exports=ShipStation;
