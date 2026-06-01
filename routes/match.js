const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// POST /api/match - Register a match result
router.post('/', async (req, res) => {
  try {
    const { team1, team2, 'team1-goals': team1Goals, 'team2-goals': team2Goals, userid } = req.body;

    // Validate required fields
    if (!team1 || !team2 || team1Goals === undefined || team2Goals === undefined || !userid) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: team1, team2, team1-goals, team2-goals, userid'
      });
    }

    // Validate goals are numbers
    if (isNaN(team1Goals) || isNaN(team2Goals)) {
      return res.status(400).json({
        success: false,
        message: 'Goals must be valid numbers'
      });
    }

    // Create new match record
    const match = new Match({
      team1,
      team2,
      team1_goals: parseInt(team1Goals),
      team2_goals: parseInt(team2Goals),
      userid
    });

    await match.save();

    res.status(201).json({
      success: true,
      message: 'Match registered successfully',
      data: match
    });

  } catch (error) {
    console.error('❌ Error registering match:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering match',
      error: error.message
    });
  }
});

// GET /api/match - Get all matches
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ created_at: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Error fetching matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
});

// GET /api/match/:id - Get match by ID
router.get('/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('❌ Error fetching match:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching match',
      error: error.message
    });
  }
});

// GET /api/match/user/:userid - Get matches by user ID
router.get('/user/:userid', async (req, res) => {
  try {
    const matches = await Match.find({ userid: req.params.userid }).sort({ created_at: -1 });

    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('❌ Error fetching user matches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user matches',
      error: error.message
    });
  }
});

module.exports = router;
