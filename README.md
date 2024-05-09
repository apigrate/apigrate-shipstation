# apigrate-shipstation

A minimal-dependency API connector that implements all the API methods of the [Shipstation API](https://www.shipstation.com/docs/api/). It fully supports async/await.

## Usage
```javascript
// Initialization
var { ShipStation } = require('@apigrate/shipstation');

var ship = new ShipStation('key', 'secret');
```

```javascript
// List Orders

let { orders } = await ship.listOrders({ page: 1, pageSize: 10, }); //etc.
```

```javascript
// Create an Order

let myOrder = await ship.createOrUpdateOrder({
    orderKey: 'TEST001',
    orderNumber: 'TEST001',
    orderDate: '2023-11-28',
    orderStatus: 'awaiting_shipment',
    billTo: {
      name: 'John Doe',
      company: 'Test Company',
      street1: '1234 Test St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
      phone: '512-555-5555',
    },
    shipTo: {
      name: 'Jane Doe',
      company: 'Test Company',
      street1: '1234 Test St',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'US',
      phone: '512-555-5555',
    },
    items:[
      {
        lineItemKey: 'SKU001',
        sku: 'SKU001',
        name: 'Test Product',
        quantity: 1,
        unitPrice: 10.00,
        taxAmount: 0,
        shippingAmount: 0,
        warehouseLocation: 'A1',
        options: [
          {
            name: 'Size',
            value: 'Large'
          }
        ]
      }
    ],
    amountPaid: 10.00,
  });

```

## Available API Endpoints

* Accounts
    * registerAccount
    * listAccounts
* Carriers
    * listCarriers
    * addFundsToCarrier
    * getCarrierInfo
    * listPackages
* Customers
    * getCustomerInfo
    * listCustomers
* Orders
    * addTag
    * assignUser
    * createOrUpdateOrder
    * createOrUpdateMultipleOrders
    * createLabelForOrder
    * deleteOrder
    * getOrder
    * holdOrder
    * listOrders
    * listOrdersByTag
    * listFulfillments
    * markShipped
    * removeTag
    * restoreFromHold
    * unassignUser
* Products
    * getProduct
    * listProducts
    * updateProduct
* Shipments
    * createLabel
    * getRates
    * listShipments
    * voidLabel
* Stores
    * deactivateStore
    * getStoreRefreshStatus
    * getStoreInfo
    * listMarketPlaces
    * listStores
    * reactivateStore
    * refreshStore
    * updateStore
* Users
    * listUsers
* Ship From Locations/Warehouses
    * createWarehouse
    * deleteWarehouse
    * getWarehouse
    * listWarehouses
    * updateWarehouse
* Webhooks
    * listWebhooks
    * subscribeToWebhook
    * unsubscribeFromWebhook

