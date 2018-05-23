# apigrate-shipstation
Shipstation API wrapper by Apigrate

## Usage
```javascript
var ShipStation = require('@apigrate/shipstation');

var ssapi = new ShipStation('key', 'secret');

orderSearchParms = {
  createDateStart: '2018-01-01 00:00:00',
  createDateEnd :'2018-03-01 00:00:00'
};

ssapi.listOrders(orderSearchParms)
.then(function(orders){
  // orders available...
})
.catch(function(err){
  // handle the error...
});
```

## Available Methods

### Carrier-Related
1. listCarriers
1. listPackagesByCarrier
1. listServicesByCarrier

### Order-Related
1. getOrder
1. listOrders
1. listOrdersTaggedWith
1. saveOrder
1. createLabelForOrder
1. markOrderAsShipped
1. tagOrder
1. untagOrder
1. holdOrderUntil

### Shipment-Related
1. listShipments
1. createShipmentLabel
1. voidLabel
1. getRates

### Tags
1. listTags

### Warehouses
1. listWarehouses
1. createWarehouse

### Webhooks
1. listWebhooks
1. subscribeWebhook
1. unsubscribeWebhook
