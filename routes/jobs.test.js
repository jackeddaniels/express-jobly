"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  job4Id,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new job",
    salary: 150000,
    equity: 0.99,
    companyHandle: "c1"
  };

  test("ok for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty('job.title', 'new job');
    expect(resp.body).toHaveProperty('job.salary', 150000);
    expect(resp.body).toHaveProperty('job.equity', '0.99');
    expect(resp.body).toHaveProperty('job.company_handle', 'c1');
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "incomplete info",
        salary: 134000,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/companies")
      .send({
        id: 600,
        title: 10,
        equity: 1.2,
        companyHandle: 'change-handle'
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 100000,
          equity: 0.66,
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 120000,
          equity: 0.67,
          company_handle: "c2",
        },
        {
          id: 3,
          title: "j3",
          salary: 130000,
          equity: 0.68,
          company_handle: "c3",
        },
        {
          id: 4,
          title: "j4",
          salary: 140000,
          equity: null,
          company_handle: "c3",
        }
      ],
    });
  });

  test("ok title filter", async function () {
    const resp = await request(app).get("/jobs?title=j1");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 100000,
          equity: 0.66,
          company_handle: "c1",
        }
      ],
    });
  });

  test("ok minSalary filter", async function () {
    const resp = await request(app).get("/jobs?minSalary=129000");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 3,
          title: "j3",
          salary: 130000,
          equity: 0.68,
          company_handle: "c3",
        },
        {
          id: 4,
          title: "j4",
          salary: 140000,
          equity: null,
          company_handle: "c3",
        }
      ],
    });
  });

  test("ok hasEquity = false", async function () {
    const resp = await request(app).get(
        "/jobs?hasEquity=false"
      );
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 4,
          title: "j4",
          salary: 140000,
          equity: null,
          company_handle: "c3",
        }
      ],
    });
  });

  test("ok hasEquity filter = true", async function () {
    const resp = await request(app).get(
        "/jobs?hasEquity=false"
      );
    expect(resp.body).toEqual({
      jobs: [
        {
          id: 1,
          title: "j1",
          salary: 100000,
          equity: 0.66,
          company_handle: "c1",
        },
        {
          id: 2,
          title: "j2",
          salary: 120000,
          equity: 0.67,
          company_handle: "c2",
        },
        {
          id: 3,
          title: "j3",
          salary: 130000,
          equity: 0.68,
          company_handle: "c3",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: [
        {
          id: 1,
          title: "j1",
          salary: 100000,
          equity: 0.66,
          company_handle: "c1",
        }
      ]
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/2`)
      .send({
        title: "j2-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: 2,
        title: "j2-new",
        salary: 120000,
        equity: 0.67,
        company_handle: "c2",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/jobs/2`).send({
      title: "j2-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/2`)
      .send({
        title: "j2-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/companies/9999`)
      .send({
        title: "j2-new",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company_handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/2`)
      .send({
        company_handle: "j2-new-handle",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/2`)
      .send({
        title: 2,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${job4.id}`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: { id: job4.id, title: "j4" } });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/jobs/2`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
      .delete(`/jobs/9999`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
