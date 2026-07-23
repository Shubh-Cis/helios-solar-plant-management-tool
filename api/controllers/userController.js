import * as userService from '../services/userService.js';

export async function getUsers(req, res) {
  try {
    const data = await userService.getAllUsers();
    res.json(data);
  } catch (error) {
    console.error('getUsers Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, projectId, assignedProjectIds } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const newUser = await userService.createUser({ name, email, password, role, projectId, assignedProjectIds });
    res.status(201).json(newUser);
  } catch (error) {
    console.error('createUser Error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await userService.authenticateUser({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json(user);
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
