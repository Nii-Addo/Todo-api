const express = require('express');
const router = express.Router();
const Joi = require('joi');
const jwtDecode = require('jwt-decode');
const jwt = require('express-jwt');

const Activities = require('../models/Activity');

const attachUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Authentication invalid' });
  }

  const decodedToken = jwtDecode(token.slice(7));

  if (!decodedToken) {
    return res.status(401).json({ message: 'There was a problem authorizing' });
  } else {
    req.user = decodedToken;
    next();
  }
};

router.use(attachUser);

const checkJwt = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  issuer: 'api.todo',
  audience: 'api.todo',
});

router.use(checkJwt);

router.post('/', async (req, res) => {
  const { sub } = req.user;
  const { error, value } = validateActivity(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const activityDto = { ...value, user: sub };
    const activity = new Activities(activityDto);
    await activity
      .save()
      .then((savedActivity) => {
        return res.status(200).json({
          message: 'Todo item created successfully',
          activity: savedActivity,
        });
      })
      .catch((error) => {
        return res.status(400).json({ message: 'Unable to create new todo' });
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  const { sub } = req.user;
  try {
    await Activities.find({ user: sub })
      .sort({ createdAt: -1 })
      .exec((err, activities) => {
        if (err)
          return res.status(400).json({ message: 'Unable to fetch todos' });
        if (!activities)
          return res.status(403).json({ message: 'Todos not found' });
        return res.status(200).json({ activities: activities });
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    await Activities.findOne({ _id: req.params.id }).exec((err, activity) => {
      if (err) return res.status(400).json({ message: 'Unable to fecth todo' });
      if (!activity) return res.status(403).json({ message: 'Todo not found' });
      return res.status(200).json({ activity: activity });
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/complete/:id', async (req, res) => {
  try {
    await Activities.findOne({ _id: req.params.id }).exec(
      async (err, activity) => {
        if (err)
          return res.status(400).json({ message: 'Unable to complete todo' });
        if (!activity)
          return res.status(403).json({ message: 'Todo not found' });
        activity.isComplete = true;
        await activity
          .save()
          .then((activity) => {
            return res.status(200).json({ message: 'todo complete' });
          })
          .catch((err) => {
            return res.status(400).json({ message: 'Unable to complete todo' });
          });
      }
    );
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Activities.findByIdAndDelete(req.params.id, function (err, docs) {
      if (err)
        return res.status(400).json({ message: 'Unable to delete todo' });
      res.status(200).json({ message: 'todo deleted' });
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

const validateActivity = (activity) => {
  const validationSchema = Joi.object().keys({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(3),
  });
  return validationSchema.validate(activity);
};

module.exports = router;
