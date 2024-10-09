// controllers/roleController.js
const Role = require('../models/role');

// Lấy tất cả vai trò
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Thêm vai trò mới
exports.addRole = async (req, res) => {
    const { name, permissions } = req.body;

    try {
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = new Role({ name, permissions });
        await role.save();
        
        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Cập nhật vai trò
exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, permissions } = req.body;

    try {
        const role = await Role.findByIdAndUpdate(id, { name, permissions }, { new: true });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json({ message: 'Role updated successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Xóa vai trò
exports.deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await Role.findByIdAndDelete(id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.status(200).json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
