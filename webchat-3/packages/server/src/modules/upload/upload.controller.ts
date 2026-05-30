import { Request, Response, NextFunction } from 'express';

export const uploadController = {
  async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      res.json({
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      next(error);
    }
  },
};
