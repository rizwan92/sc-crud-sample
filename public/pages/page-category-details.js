import SCCollection from '/node_modules/sc-collection/sc-collection.js';
import SCModel from '/node_modules/sc-model/sc-model.js';

function getPageComponent(pageOptions) {
  return Vue.extend({
    props: {
      categoryId: String
    },
    data: function () {
      this.categoryModel = new SCModel({
        socket: pageOptions.socket,
        type: 'Category',
        id: this.categoryId,
        fields: ['name', 'desc']
      });

      this.productsCollection = new SCCollection({
        socket: pageOptions.socket,
        type: 'Product',
        fields: ['name', 'qty', 'price'],
        view: 'categoryView',
        viewParams: {category: this.categoryId},
        pageOffset: 0,
        pageSize: 5,
        getCount: true
      });

      return {
        category: this.categoryModel.value,
        products: this.productsCollection.value,
        productsMeta: this.productsCollection.meta,
        newProductName: '',
        realtime: true
      };
    },
    computed: {
      firstItemIndex: function () {
        if (!this.products.length) {
          return 0;
        }
        return this.productsMeta.pageOffset + 1;
      },
      lastItemIndex: function () {
        return this.productsMeta.pageOffset + this.products.length;
      }
    },
    methods: {
      computeProductDetailsUrl: function (category, product) {
        return `#/category/${category.id}/product/${product.id}`;
      },
      addProduct: function () {
        if (this.newProductName === '') {
          return;
        }
        var newProduct = {
          name: this.newProductName,
          category: this.category.id
        };
        this.newProductName = '';

        this.productsCollection.create(newProduct)
        .then((err, newId) => {
          // TODO: Success message
        })
        .catch((err) => {
          // TODO: Handle error
        });
      },
      goToPrevPage: function () {
        this.productsCollection.fetchPreviousPage();
      },
      goToNextPage: function () {
        this.productsCollection.fetchNextPage();
      }
    },
    beforeRouteLeave: function (to, from, next) {
      this.categoryModel.destroy();
      this.productsCollection.destroy();
      next();
    },
    template: `
      <div class="page-container">
        <a href="/#/"><< Back to category list</a>
        <h2 class="content-row heading">{{category.name}}</h2>
        <div class="content-body">
          <p>
            <h4>Category description:</h4>
            <span>{{category.desc}}</span>
          </p>
          <h4>Products:</h4>
          <table class="table">
            <tr v-for="product of products">
              <td><a :href="computeProductDetailsUrl(category, product)">{{product.name}}</a></td>
              <td>{{product.qty}}</td>
              <td>{{product.price}}</td>
            </tr>
          </table>
          <div class="content-row control-bar">
            <div class="content-col-half search-container">
              <input type="text" class="form-control" v-model="newProductName">
            </div>
            <div class="content-col-half">
              <input type="button" class="btn" value="Add product" @click="addProduct">
              <input type="checkbox" class="checkbox" style="margin-left: 10px; margin-top: 0;" v-model="realtime"> <span>Realtime collection</span>
            </div>
          </div>
          <div class="content-row">
            <div class="content-col">
              <a href="javascript:void(0);" @click="goToPrevPage">Prev page</a> <span>Items </span><span>{{firstItemIndex}}</span><span> to </span><span>{{lastItemIndex}}</span> of <span>{{productsMeta.count}}</span> <a href="javascript:void(0);" @click="goToNextPage">Next page</a>
            </div>
          </div>
        </div>
      </div>
    `
  });
}

export default getPageComponent;
