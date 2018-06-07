import { Handler, Context, Callback}  from 'aws-lambda';
import { Login, UserLogin } from './login';

interface LoginResponse {
  statusCode: number;
  body: string;
  headers: Object;
}

const login: Handler = (event: any, ctx: Context, cb: Callback) => {
  console.log(`Event=${JSON.stringify(event)}`);

  const login = parseLoginInfo(event.body);
  console.log(`User=${login.user};Pass=${login.pass}`);

  new Login().login(login.user, login.pass)
    .then(handleSuccess(cb), handleFailure(cb))
    .catch((err) => {
      const response: LoginResponse=  {
      statusCode: 500,
      body: JSON.stringify(err),
      headers: {}
    };
    cb(err, response);
  });
};

function parseLoginInfo(body: any): {user: string, pass: string} {
  const data = JSON.parse(body);
  return {
    user: `${data.userName}`,
    pass: `${data.password}`
  };
}

function handleSuccess(cb: Callback) : (result: UserLogin) => void {
  return function(result: UserLogin): void {
    console.log(`Login returned result: ${JSON.stringify(result)}`);
    const response: LoginResponse = {
    statusCode: 200,
      body: JSON.stringify({result}),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      }
    };
    cb(null, response);
  }
}

function handleFailure(cb: Callback): (err: Error) => void {
  return function(err: Error): void {
    console.log(`Login returned error: ${JSON.stringify(err)}`);
    const response: LoginResponse = {
      statusCode: 401,
      body: JSON.stringify(err),
      headers: {
          "Access-Control-Allow-Origin": "*", // Required for CORS support to work
          "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
      }};
    cb(null, response);
  }
}

export { login };