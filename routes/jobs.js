"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

const router = new express.Router();

/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { job: { id, title, salary, equity, company_handle } }
 *
 * Can filter on provided search filters:
 * - title: string
 * - minSalary: integer
 * - hasEquity: boolean value
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  const queries = req.query;

  for (const key in queries) {
    if (key === "minSalary") {
      queries[key] = Number(queries[key]);
    }
  }

  const validator = jsonschema.validate(queries, jobSearchSchema, {
    required: true,
  });

  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const jobs = await Job.findAll(queries);
  return res.json({ jobs });
});

/** GET /[id]  =>  { job }
 *
 *  Job is { job: { id, title, salary, equity, company_handle } }
 *
 * Authorization required: none
 */

router.get("/:handle", async function (req, res, next) {
  const job = await Job.get(req.params.handle);
  return res.json({ job });
});

/** PATCH /[handle] { fld1, fld2, ... } => {  }
 *
 * Patches  data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: admin
 */

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobUpdateSchema, {
    required: true,
  });
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.update(req.params.handle, req.body);
  return res.json({ job });
});

/** DELETE /[id]  =>  { deleted: id, title }
 *
 * Authorization: admin
 */

router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  const { id, title } = await Job.remove(req.params.handle);
  return res.json({ deleted: { id, title } });
});

module.exports = router;
