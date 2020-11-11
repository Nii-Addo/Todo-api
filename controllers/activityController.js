const express = require('express');
const router = express.Router();
const Joi = require('joi');

const Activities = require('../models/Activity');

router.post('/', async (req, res) => {
  const { error, value } = validateActivity(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    const activityDto = { ...value };
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
  try {
    await Activities.find({}).exec((err, activities) => {
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

router.put('/:id', async (req, res) => {
  const { error, value } = validateActivity(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  try {
    await Activities.findOne({ _id: req.params.id }).exec((err, activity) => {
      if (err)
        return res.status(400).json({ message: 'Unable to edit new todo' });
      if (!activity) return res.status(403).json({ message: 'Todo not found' });
      activity.title = value.title;
      activity.description = value.description;
      activity
        .save()
        .then((activity) => {
          return res.status(200).json({ activity: activity });
        })
        .catch((err) => {
          return res.status(400).json({ message: 'Unable to edit todo' });
        });
    });
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
