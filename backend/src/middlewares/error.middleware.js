const { HttpError } = require('../utils/http-error');

function notFound(request, _response, next) {
  next(new HttpError(404, `Route not found: ${request.method} ${request.originalUrl}`));
}

function errorHandler(error, _request, response, _next) {
  if (error.code === 11000) {
    return response.status(409).json({ error: 'A record with this value already exists' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return response.status(400).json({ error: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must be valid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request body is too large' });
  }
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ error: error.message });
  }

  console.error(error);
  return response.status(500).json({ error: 'Internal server error' });
}

module.exports = { errorHandler, notFound };
