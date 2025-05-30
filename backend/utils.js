import {jwtVerify, SignJWT} from 'jose'

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function generateToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({alg: 'HS256'})
    .setExpirationTime('72h')
    .sign(SECRET_KEY);
}


async function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log(authHeader, "herer")
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({mensagem: 'Token não fornecido'});
  }

  try {
    const {payload} = await jwtVerify(token, SECRET_KEY, {
      algorithms: ['HS256'],
    });
    req.user = payload;
    next();
  } catch (error) {
    console.error(error);
    return res.status(403).json({mensagem: 'Token inválido'});
  }
}

function requestInfo(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];
  req.clientInfo = {
    ip,
    userAgent,
  };
  next();
}


export {generateOtp, generateToken, verifyToken, requestInfo}
