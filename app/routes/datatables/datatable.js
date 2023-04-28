const express = require('express');
const router = express.Router();

const User = require('../../models/mysql/user');

const { SQLRowAsync } = require('../../models/queryTools');

const sql = require('../../db');

// ID Type City HaveAds Placements
router.use('/fleet', (req, res) => {
  let count = 1;
  sql.query(
    'SELECT v._id, numberPlate, o.company, totalAds FROM Vehicle v LEFT JOIN Operator o ON o._id = v.operator_id WHERE v.listed = 1;',
    [],
    (err, data) => {
      if (err) return res.send({});
      const mapped = data.map((v) => {
        return { nr: count++, ...v };
      });
      return res.send({ data: mapped });
    }
  );
});

// ID Role Name email Phone Added
router.use('/users', (_, res) => {
  User.getAll((err, data) => (err ? res.send({}) : res.send({ data })), {
    select: '_id, role, name, email, phone, created_at',
  });
});

// ID Company Campaigns Total Spent Added ContactPerson
router.use('/clients', (req, res) => {
  sql.query(
    'SELECT c._id, c.company, c.person, c.created_at, c.totalBudget, COUNT(a._id) AS campaigns FROM Client c LEFT JOIN Campaign a ON a.client_id=c._id group by _id',
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});

// ID Name Company Cities Budget Start End Added
router.use('/campaigns', (req, res) => {
  sql.query(
    'SELECT m._id, m.name, c.company AS company, m.budget, m.startDate, m.endDate, m.created_at FROM Campaign m INNER JOIN Client c ON m.client_id = c._id',
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});

// User(Sales) RunningCampaignsCount TotalCampaignsCount TotalMoneyMade
router.use('/sales', (_, res) => {
  sql.query(
    `SELECT u._id, u.name, sum(c.budget) budget, count(c._id) campaigns, sum(if(c.startDate > now() AND c.endDate < now(), 1, 0)) running FROM User u
LEFT JOIN Campaign c ON c.creator_id = u._id 
GROUP BY _id HAVING campaigns`,
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});

router.use('/vehicle/:id', (req, res) => {
  sql.query(
    `SELECT pl.name place, c.name campaign, i.count, i.created_at FROM Install i 
LEFT JOIN Campaign c ON i.campaign_id = c._id 
LEFT JOIN Placement p ON i.placement_id = p._id
LEFT JOIN Place pl ON p.place_id = pl._id
WHERE installed = 1 and vehicle_id = ?`,
    [req.params.id],
    async (err, data) => {
      if (err) return res.send({});
      res.send({ data });
    }
  );
});

router.use('/campaign/:id', (req, res) => {
  sql.query(
    `SELECT v._id, c.name city, o.company operator, i.count, i.remove_id FROM Install i
LEFT JOIN Vehicle v on i.vehicle_id = v._id
LEFT JOIN City c ON c._id = v.city_id 
LEFT JOIN Operator o ON o._id = v.operator_id
WHERE i.campaign_id = ?;`,
    [req.params.id],
    async (err, data) => {
      if (err) return res.send({});
      res.send({ data });
    }
  );
});

// Sales(Sales) CampaignName StartDate EndDate Placements Vehicles Cities Budget

// // Role User(All) email > PreStart Start  Install Done
router.use('/mails', (_, res) => {
  sql.query(
    'SELECT _id, role, name, email, mailCampCreated, mailCampChanged, mailPreStart, mailStart, mailPreEnd, mailEnd, mailInstallDone, mailRemoveDone FROM Mail',
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});
router.use('/teams', (_, res) => {
  sql.query(
    'SELECT t._id, t.company, COUNT(i._id) AS members, t.created_at FROM Team AS t LEFT JOIN Installer AS i ON t._id = i.team_id AND i.isActive = 1 GROUP BY t._id;',
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});
router.use('/team/:id', (req, res) => {
  sql.query(
    'SELECT i._id, (SELECT name FROM User where _id = i.user_id) as name, i.created_at FROM Installer as i WHERE team_id = ? AND isActive=1;',
    [req.params.id],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});
router.use('/assignments', (req, res) => {
  sql.query(
    'SELECT a._id, a.priority, name, SUM(i.count) placements, SUM(o.count) assigned, a.startDate, a.endDate FROM Campaign a LEFT JOIN Placement i ON a._id = i.campaign_id LEFT JOIN InstallOrder o ON a._id = o.campaign_id GROUP BY a._id;',
    [],
    (err, data) => (err ? res.send({}) : res.send({ data }))
  );
});

router.use('/', (req, res) => {
  return res.sendStatus(404);
});

module.exports = router;
