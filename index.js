/*
  Copyright 2024 Apigrate, LLC

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
const debug = require('debug')('gr8:shipstation');
const verbose = require('debug')('gr8:shipstation:verbose');

/**
 * NodeJS ShipStation API Connector.
 * 
 * For API documentation, see: https://www.shipstation.com/docs/api/
 */
class ShipStation {
  /**
   * @param {string} apiKey 
   * @param {string} apiSecret
   */
  constructor(apiKey, apiSecret){
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.baseUrl = 'https://ssapi.shipstation.com';
  }

  //
  // ACCOUNTS
  //

  /**
   * Creates a new ShipStation account and generates an apiKey and apiSecret to be used by the newly created account.
   * NOTE: this endpoint is only Available for ShipStation Partner Accounts.
   * @see https://www.shipstation.com/docs/api/accounts/create/
   */
  async registerAccount(payload){
    return this.doFetch('POST', '/accounts/registeraccount', null, payload);
  }

  /**
   * Lists all tags associated with the account.
   * @see https://www.shipstation.com/docs/api/accounts/list-tags/
   */
  async listAccountTags(){
    return this.doFetch('GET', '/accounts/listtags');
  }


  //
  // CARRIERS
  //

  /**
   * Lists all shipping providers connected to this account.
   */
  async listCarriers(){
    return this.doFetch('GET', '/carriers');
  }

  async addFundsToCarrier(carrierCode, amount){
    return this.doFetch('POST', '/carriers/addfunds', null, { carrierCode, amount });
  }

  async getCarrierInfo(carrierCode){
    return this.doFetch('GET', `/carriers/${carrierCode}`);
  }

  async listPackages(carrierCode){
    return this.doFetch('GET', `/carriers/listpackages?carrierCode=${encodeURIComponent(carrierCode)}`);
  }

  //
  // CUSTOMERS
  //

  async getCustomerInfo(customerId){
    return this.doFetch('GET', `/customers/${customerId}`);
  }

  async listCustomers(query){
    return this.doFetch('GET', '/customers', query);
  }



  //
  // ORDERS
  //

  /**
   * Add a tag to an order.
   * @param {string} orderId the order ID
   * @param {string} tagId the tag ID
   * @see https://www.shipstation.com/docs/api/orders/add-tag/
   * @returns {object} the result object: `{ success, message }`
   */
  async addTag(orderId, tagId){
    return this.doFetch('POST', `/orders/addtag`, null, { orderId, tagId });
  }
  /**
   * Assigns a user to one or more order ids.
   * @param {array} orderIds an array of order IDs
   * @param {string} userId the user ID
   * @see https://www.shipstation.com/docs/api/orders/assign-user/
   */
  async assignUser(orderIds, userId){
    return this.doFetch('POST', '/orders/assignuser', null, { orderIds, userId });
  }

  /**
   * Create or update an order.
   * Only orders in an open status in ShipStation (`awaiting_payment`,`awaiting_shipment`, and `on_hold`) can be updated through this method. 
   * Orders in the `cancelled` and `shipped` states may not be updated. 
   * @param {object} order the order object to save
   * @see https://www.shipstation.com/docs/api/orders/create-update-order/
   * @returns {object} the order object
   */
  async createOrUpdateOrder(order){
    return this.doFetch('POST', '/orders/createorder', null, order);
  }

  /**
   * Create or update multiple orders.
   * Only orders in an open status in ShipStation (`awaiting_payment`,`awaiting_shipment`, and `on_hold`) can be updated through this method.
   * Orders in the `cancelled` and `shipped` states may not be updated.
   * @param {array} orders an array of order objects to save
   * @see https://www.shipstation.com/docs/api/orders/create-update-multiple-orders/
   * @returns {object} result of the form:
   * ```
   * {
   * "hasErrors": false,
   * "results": [
   *     {
   *         "orderId": 168426889,
   *         "orderNumber": "TEST-ORDER-API-DOCS-01",
   *         "orderKey": "0f6bec18-3e89-4881-83aa-f392d84f4c74",
   *         "success": true,
   *         "errorMessage": null
   *     },
   *     {
   *         "orderId": 168432343,
   *         "orderNumber": "TEST-ORDER-API-DOCS-02",
   *         "orderKey": "0d6bec18-3e79-4981-83ca-f392d84f4c19",
   *         "success": true,
   *         "errorMessage": null
   *     }
   * ]
   * }
   * ```
   */
  async createOrUpdateMultipleOrders(orders){
    return this.doFetch('POST', '/orders/createorders', null, orders);
  }

  /**
   * Create a label for an order.
   * @param {object} payload the label payload
   * @see https://www.shipstation.com/docs/api/orders/create-label/
   * @returns {object} the label object
   */
  async createLabelForOrder(payload){
    let required = ['orderId', 'carrierCode', 'serviceCode', 'confirmation', 'shipDate', 'testLabel'];
    for(let r of required){
      if(!payload[r]) throw new Error(`Missing required field: ${r}`);
    }
    return this.doFetch('POST', '/orders/createlabelfororder', null, payload);
  }

  /**
   * Delete an order by ID
   * @param {string} orderId the order ID
   * @see https://www.shipstation.com/docs/api/orders/delete-order/
   * @returns {object} the result object: `{ success, message }`
   */
  async deleteOrder(orderId){
    return this.doFetch('DELETE', `/orders/${orderId}`);
  }

  /**
   * Get an order by ID
   * @param {string} orderId the order ID
   * @see https://www.shipstation.com/docs/api/orders/get-order/
   * @returns {object} the order object
   */
  async getOrder(orderId){
    return this.doFetch('GET', `/orders/${orderId}`);
  }

  /**
   * Hold an order until a specified date.
   * @param {string} orderId the order ID
   * @param {string} holdUntilDate the hold until date
   * @see https://www.shipstation.com/docs/api/orders/hold-order-until/
   * @returns {object} the result object: `{ success, message }`
   */
  async holdOrder(orderId, holdUntilDate){
    return this.doFetch('POST', '/orders/holduntil', null, { orderId, holdUntilDate });
  }

  /**
   * Lists orders.
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/orders/list-orders/
   * @returns {object} the response object `{ orders: [...] }`
   */
  async listOrders(query){
    return this.doFetch('GET', '/orders', query);
  }

  /**
   * Lists orders by tag.
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/orders/list-by-tag/
   * @returns {object} the response object `{ orders: [...] }`
   */
  async listOrdersByTag(query){
    let required = ['orderStatus', 'tagId'];
    for(let r of required){
      if(!query[r]) throw new Error(`Missing required field: ${r}`);
    }
    return this.doFetch('GET', `/orders/listbytag/${tagId}`, query);
  }

  /**
   * Lists fulfillments.
   * 
   * Note: Orders that have been marked as shipped either through the UI or the API will appear in the response as they are considered fulfillments.
   * 
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/fulfillments/list-fulfillments/
   * @returns {object} the response object `{ fulfillments: [...] }`
   */
  async listFulfillments(query){
    return this.doFetch('GET', '/fulfillments', query);
  }
  
  /**
   * Marks an order as shipped.
   * @param {string} orderId the order ID (required)
   * @param {string} carrierCode the carrier code (required)
   * @param {string} shipDate the ship date
   * @param {string} trackingNumber the tracking number
   * @param {boolean} notifyCustomer whether to notify the customer
   * @param {boolean} notifySalesChannel whether to notify the sales channel
   * @see https://www.shipstation.com/docs/api/orders/mark-as-shipped/
   */
  async markShipped(orderId, carrierCode, shipDate, trackingNumber, notifyCustomer){
    return this.doFetch('POST', '/orders/markasshipped', null, { orderId, carrierCode, shipDate, trackingNumber, notifyCustomer });
  }

  /**
   * Removes a tag from an order.
   * @param {string} orderId the order ID
   * @param {string} tagId the tag ID
   * @see https://www.shipstation.com/docs/api/orders/remove-tag/
   * @returns {object} the result object: `{ success, message }`
   */
  async removeTag(orderId, tagId){
    return this.doFetch('POST', `/orders/removetag`, null, { orderId, tagId });
  }

  /**
   * Restores an order from hold.
   * @param {string} orderId the order ID
   * @see https://www.shipstation.com/docs/api/orders/restore-from-hold/
   * @returns {object} the result object: `{ success, message }`
   */
  async restoreFromHold(orderId){
    return this.doFetch('POST', '/orders/restorefromhold', null, { orderId });
  }

  /**
   * Unassigns a user from one or more order ids.
   * NOTE: If ANY of the orders within the array are not found, then no orders will have their users unassigned
   * @param {array} orderIds an array of order IDs
   * @see https://www.shipstation.com/docs/api/orders/unassign-user/
   * @returns {object} the result object: `{ success, message }`
   */
  async unassignUser(orderIds){
    return this.doFetch('POST', '/orders/unassignuser', null, { orderIds });
  }

  // 
  // PRODUCTS
  //

  /**
   * Get a product by ID
   * @param {string} productId the product ID
   * @see https://www.shipstation.com/docs/api/products/get-product/
   * @returns {object} the product object
   */
  async getProduct(productId){
    return this.doFetch('GET', `/products/${productId}`);
  }

  /**
   * Lists products.
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/products/list/
   * @returns {object} the response object `{ products: [...] }`
   */
  async listProducts(query){
    return this.doFetch('GET', '/products', query);
  }

  /**
   * Update a product.
   * @param {object} product the product object
   * @see https://www.shipstation.com/docs/api/products/update/
   * @returns {object} the product object
   */
  async updateProduct(product){
    if(!product.productId) throw new Error('Missing required field: productId');
    return this.doFetch('PUT', `/products/${product.productId}`, null, product);
  }


  //
  // SHIPMENTS
  //

  /**
   * Create a shipping label.
   * The labelData field returned in the response is a `base64` encoded PDF value. You can decode 
   * and save the output as a PDF file to retrieve a printable label. 
   * @param {object} payload the label payload
   * @see https://www.shipstation.com/docs/api/shipments/create-label/
   * @returns {object} the label object
   */
  async createLabel(payload){
    return this.doFetch('POST', '/shipments/createlabel', null, payload);
  }

  /**
   * Retrieves shipping rates for the specified shipping details.
   * @param {object} payload the rate request payload
   * @see https://www.shipstation.com/docs/api/shipments/get-rates/
   * @returns {array} the rates array
   */
  async getRates(payload){
    return this.doFetch('POST', '/shipments/getrates', null, payload);
  }

  /**
   * Obtains a list of shipments that match the specified criteria.
   * 
   * NOTE: Only valid shipments with labels **generated in ShipStation** will be returned in the response. 
   * **Orders that have been marked as Shipped either through the UI or the API will NOT appear** as they are considered external shipments.
   * 
   * To include every shipment's associated shipmentItems in the response, be sure to set the includeShipmentItems parameter to true.
   * 
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/shipments/list/
   * @returns {object} the response object `{ shipments: [...] }`
   * 
   */
  async listShipments(query){
    return this.doFetch('GET', '/shipments', query);
  }

  /**
   * Voids the specified label by shipment ID.
   * @param {string} shipmentId the shipment ID
   * @see https://www.shipstation.com/docs/api/shipments/void-label/
   * @returns {object} the result object: `{ success, message }`
   */
  async voidLabel(shipmentId){
    return this.doFetch('POST', '/shipments/voidlabel', null, { shipmentId });
  }


  //
  // STORES
  //

  /**
   * Deactivate a store.
   * @param {string} storeId the store ID
   * @see https://www.shipstation.com/docs/api/stores/deactivate/
   * @returns {object} the result object: `{ success, message }`
   */
  async deactivateStore(storeId){
    return this.doFetch('POST', '/stores/deactivate', null, { storeId });
  }

  /**
   * Get store refresh status.
   * @param {string} storeId the store ID
   * @see https://www.shipstation.com/docs/api/stores/get-refresh-status/
   */
  async getStoreRefreshStatus(storeId){
    return this.doFetch('GET', `/stores/getrefreshstatus`, {storeId});
  }

  /**
   * Get store info.
   * @param {string} storeId the store ID
   * @see https://www.shipstation.com/docs/api/stores/get-store/
   * @returns {object} the store object
   */
  async getStoreInfo(storeId){
    return this.doFetch('GET', `/stores/${storeId}`);
  }

  /**
   * Lists the marketplaces that can be integrated with ShipStation
   * @see https://www.shipstation.com/docs/api/stores/marketplaces/
   * @returns {array} the marketplaces array
   */
  async listMarketPlaces(){
    return this.doFetch('GET', '/stores/marketplaces');
  }

  /**
   * Lists stores.
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/stores/list/
   */
  async listStores(query){
    return this.doFetch('GET', '/stores', query);
  }

  /**
   * Reactivates a store.
   * @param {string} storeId the store ID
   * @see https://www.shipstation.com/docs/api/stores/reactivate/
   * @returns {object} the result object: `{ success, message }`
   */
  async reactivateStore(storeId){
    return this.doFetch('POST', '/stores/reactivate', null, { storeId });
  }

  /**
   * Refreshes a store.
   * @param {string} storeId the store ID
   * @param {string} refreshDate the refresh date 
   * @see https://www.shipstation.com/docs/api/stores/refresh/
   */
  async refreshStore(storeId, refreshDate){
    return this.doFetch('POST', `/stores/refresh`, { storeId, refreshDate}, { storeId, refreshDate});
  }

  /**
   * Update a store.
   * @param {object} store the store object
   * @see https://www.shipstation.com/docs/api/stores/update/
   * @returns {object} the store object
   * 
   */
  async updateStore(store){
    return this.doFetch('PUT', `/stores/${store.storeId}`, null, store);
  }

  //
  // USERS
  // 

  /**
   * Lists users.
   * @param {object} query hash of query parameters
   * @see https://www.shipstation.com/docs/api/users/list/
   * @returns {object} the response object `{ users: [...] }`
   */
  async listUsers(query){
    return this.doFetch('GET', '/users', query);
  }
  //
  // SHIP FROM LOCATIONS / WAREHOUSES
  //

  /**
   * Create a warehouse (Ship From Location).
   * @param {object} warehouse the warehouse object
   * @see https://www.shipstation.com/docs/api/warehouses/create/
   * @returns {object} the warehouse object
   * 
   */
  async createWarehouse(warehouse){
    return this.doFetch('POST', '/warehouses', null, warehouse);
  }

  /**
   * Delete a warehouse (Ship From Location). This is a "soft" delete action, so the warehouse (or Ship From location) 
   * will still exist in the database, but this action will set it to Inactive status.
   * @param {string} warehouseId the warehouse ID
   * @see https://www.shipstation.com/docs/api/warehouses/delete/
   */
  async deleteWarehouse(warehouseId){
    return this.doFetch('DELETE', `/warehouses/${warehouseId}`);
  }

  /**
   * Get a warehouse (Ship From Location) by ID. 
   * @param {string} warehouseId the warehouse ID
   * @see https://www.shipstation.com/docs/api/warehouses/get/
   * @returns {object} the warehouse object
   */
  async getWarehouse(warehouseId){
    return this.doFetch('GET', `/warehouses/${warehouseId}`);
  }

  /**
   * List warehouses (Ship From Locations).
   * @see https://www.shipstation.com/docs/api/warehouses/list/
   * @returns {array} the warehouses array
   */
  async listWarehouses(){
    return this.doFetch('GET', '/warehouses');
  }

  /**
   * Update a warehouse (Ship From Location).
   * @param {object} warehouse the warehouse object
   * @see https://www.shipstation.com/docs/api/warehouses/update/
   * @returns {object} the warehouse object
   */
  async updateWarehouse(warehouse){
    return this.doFetch('PUT', `/warehouses/${warehouse.warehouseId}`, null, warehouse);
  }



  //
  // WEBHOOKS
  //

  /**
   * List webhooks.
   * @see https://www.shipstation.com/docs/api/webhooks/list/
   * 
   * @returns {array} the webhooks array
   * 
   */
  async listWebhooks(){
    return this.doFetch('GET', '/webhooks');
  }

  /**
   * Subscribe to a webhook.
   * @param {object} payload the webhook payload
   * @see https://www.shipstation.com/docs/api/webhooks/subscribe/
   * @returns {object} the webhook object
   * 
   */
  async subscribeToWebhook(payload){
    return this.doFetch('POST', '/webhooks/subscribe', null, payload);
  }

  /**
   * Unsubscribe from a webhook. 
   * 
   * No result is returned, but an error will be thrown if the operation fails.
   * @param {string} webhookId the webhook ID
   * @see https://www.shipstation.com/docs/api/webhooks/unsubscribe/
   */
  async unsubscribeFromWebhook(webhookId){
    return this.doFetch('DELETE', `/webhooks/${webhookId}`);
  }




  // INTERNAL METHODS ................................................................................

  /**
   * Internal method to make an API call using node-fetch.
   * 
   * @param {string} method GET|POST|PUT|DELETE
   * @param {string} url api endpoint url (without query parameters). If not absolute, the baseUrl is prepended.
   * @param {object} query hash of query string parameters to be added to the url
   * @param {object} payload for POST, PUT methods, the data payload to be sent
   * @param {object} options hash of additional options
   */
  async doFetch(method, url, query, payload, options){
    
    let fetchOpts = {
      method,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Apigrate ShipStation NodeJS Connector/3.0.0",
        "Authorization" : "Basic " + Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')
      },
    };
    
    let qstring = '';
    if(query){
      for(let key in query){
        qstring += `&${key}=${encodeURIComponent(query[key])}`;
      }
      qstring = '?' + qstring.substring(1);
    }
    let full_url = `${url.includes('http') ? '' : this.baseUrl}${url}${qstring}`;
    
    if(payload){
      fetchOpts.body = JSON.stringify(payload);
    }

    let content = '';
    try{
      debug(`${method} ${full_url}`);
      if(payload) verbose(`  request payload: ${JSON.stringify(payload)}`);
      
      let response = await fetch(full_url, fetchOpts);

      // Parse the content.
      if(response.headers.get("Content-Length") > 0){
        if( response.headers.get("Content-Type").includes("/json") ){
          content = await response.json();
          verbose(`  response payload:\n${JSON.stringify(content)}`);
        } else {
          content = await response.text();
          verbose(`  response payload:\n${content}`);
        }
      }


      response.headers.forEach((value, name) => {
        verbose(`  response header: ${name}=${value}`);
      });

      // Evaluate the response
      if(response.ok){
        debug(`  ...OK HTTP-${response.status}`);
        return content;
      } else if (response.status >=300 & response.status < 400){
        debug(`  ...Redirection. HTTP-${response.status}`);
        return content; //probably won't be any content but return it anyway.
      } else {
        if (response.status >=400 & response.status < 500){
          debug(`  ...Client Error. HTTP-${response.status}`);
          if(response.status === 401 || response.status === 403){
            //Class as different error. Allows control flow for OAuth, other scenarios. 
            throw new ApiAuthError("Authorization error.", response.status, content);
          }
          throw new ApiError("Client error.", response.status, content);

        } else if (response.status >=500) {
          debug(`  ...Server Error. HTTP-${response.status}`);
          throw new ApiError("Server error.", response.status, content);
        
        } else {
          debug(`  ...Unclassified Error. HTTP-${response.status}`);
          console.error(err);
          throw err; //Cannot be handled.
        }
        
      }

    }catch(err){
      if(err instanceof ApiError) throw err;
      //Unhandled errors are noted and re-thrown.
      console.error(err);
      throw err;
    }
  }

}

class ApiError extends Error {};
class ApiAuthError extends Error {};
exports.ShipStation = ShipStation;
exports.ApiError = ApiError;
exports.ApiAuthError = ApiAuthError;