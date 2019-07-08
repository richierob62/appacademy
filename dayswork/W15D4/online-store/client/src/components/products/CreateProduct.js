import React, { Component } from "react";
import { Mutation } from "react-apollo";
import { CREATE_PRODUCT } from "../../graphql/mutations";
import { FETCH_PRODUCTS } from "../../graphql/queries";
import CategoryDropdown from "../CategoryDropdown";
import { Query } from 'react-apollo'
import { FETCH_CATEGORIES } from '../../graphql/queries'

class CreateProduct extends Component {
  defaultcat;
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: "",
      weight: "",
      description: "",
      category: ""
    };

  }

  update(field) {
    return e => {
      
      this.setState({ [field]: e.target.value });
    }
  }


  // we need to remember to update our cache directly with our new product
  updateCache(cache, { data }) {
    let products;
    try {
      // if we've already fetched the products then we can read the
      // query here
      products = cache.readQuery({ query: FETCH_PRODUCTS });
    } catch (err) {
      return;
    }
    // if we had previously fetched products we'll add our new product to our cache
    if (products) {
      let productArray = products.products;
      let newProduct = data.newProduct;
      cache.writeQuery({
        query: FETCH_PRODUCTS,
        data: { products: productArray.concat(newProduct) }
      });
    }
  }

  handleSubmit(e, newProduct) {
    e.preventDefault();
    
    newProduct({
      variables: {
        name: this.state.name,
        description: this.state.description,
        weight: parseInt(this.state.weight),
        category: this.state.category ? this.state.category : this.defaultcat 
      }
    });
  }

  render() {
    return (
      <Mutation
        mutation={CREATE_PRODUCT}
        // if we error out we can set the message here
        onError={err => this.setState({ message: err.message })}
        // we need to make sure we update our cache once our new product is created
        update={(cache, data) => this.updateCache(cache, data)}
        // when our query is complete we'll display a success message
        onCompleted={data => {
          const { name } = data.newProduct;
          this.setState({
            message: `New product ${name} created successfully`
          });
        }}
      >
        {(newProduct, { data }) => (
          <div>
            <form onSubmit={e => this.handleSubmit(e, newProduct)}>
              <input
                onChange={this.update("name")}
                value={this.state.name}
                placeholder="Name"
              />
              <textarea
                onChange={this.update("description")}
                value={this.state.description}
                placeholder="description"
              />
              <input
                onChange={this.update("weight")}
                value={this.state.weight}
                placeholder="Weight"
                type="number"
              />

              <Query query={FETCH_CATEGORIES}>
                {({ loading, error, data }) => {
                    if (loading) return null
                    this.defaultcat = data.categories[0]._id
                    return (
                      <CategoryDropdown onChange={this.update("category")} 
                                        categories={data.categories} />
                    );
                }}
              </Query>

              
              
              <button type="submit">Create Product</button>
            </form>
            <p>{this.state.message}</p>
          </div>
        )}
      </Mutation>
    );
  }
}

export default CreateProduct; 