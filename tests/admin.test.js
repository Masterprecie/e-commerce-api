const app = require("../bin/www");
const mongoose = require("mongoose");
const request = require("supertest");
const usersModel = require("../models/usersModel");
const productModel = require("../models/productModel");
const path = require("path");

let adminToken;
let secondProductId;

beforeAll(async () => {
  await usersModel.deleteMany();
  await productModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  app.close();
});

describe("This is a test for admin registration and login ", () => {
  test("Register an Admin", async () => {
    const response = await request(app).post("/v1/auth/register").send({
      firstName: "Admin",
      lastName: "Presh",
      email: "presh@btcmod.com",
      password: "12345",
    });
    await usersModel.findOneAndUpdate(
      { email: "presh@btcmod.com" },
      { isEmailVerified: true, role: "admin" },
      { new: true }
    );
    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  test("Login an Admin", async () => {
    const response = await request(app).post("/v1/auth/login").send({
      email: "presh@btcmod.com",
      password: "12345",
    });

    adminToken = response.body.access_token;
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Login successful");
    expect(response.body.user).toBeTruthy();
    expect(response.body.access_token).toBeTruthy();
    expect(response.body.user.role).toBe("admin");
    expect(response.body.user.isEmailVerified).toBe(true);
  });
});

describe("This is a test for admin to add product, edit product and delete product", () => {
  test("Add a product", async () => {
    const response = await request(app)
      .post("/v1/admin/product")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productName", "Laptop")
      .field("description", "A very powerful laptop")
      .field("price", 1000)
      .field("stock", 20)
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      )
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      );

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Product created successfully");
  });

  test("Add a second product", async () => {
    const response = await request(app)
      .post("/v1/admin/product")
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productName", "Bag")
      .field("description", "A very powerful bag")
      .field("price", 500)
      .field("stock", 10)
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      )
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      );

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Product created successfully");
  });

  test("Get all products", async () => {
    const response = await request(app)
      .get("/v1/admin/products/1/2")
      .set("Authorization", `Bearer ${adminToken}`);
    secondProductId = response.body.products.docs[1]._id;
    expect(response.status).toBe(200);
    expect(response.body.products.docs.length).toBe(2);
  });

  test("Get a single product", async () => {
    const response = await request(app)
      .get(`/v1/admin/product/${secondProductId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.product).toBeTruthy();
  });

  test("Edit the second product", async () => {
    const response = await request(app)
      .put(`/v1/admin/product/${secondProductId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .field("productName", "Editted Bag")
      .field("description", "A very powerful bag")
      .field("price", 200)
      .field("stock", 10)
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      )
      .attach(
        "productImages",
        path.resolve(__dirname, "../public/images/hh.jpg")
      );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Product updated successfully");
  });

  test("Delete a product", async () => {
    const response = await request(app)
      .delete(`/v1/admin/product/${secondProductId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Product deleted successfully");
  });
});
