import { CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import "source-map-support/register";

import { decode, verify } from "jsonwebtoken";
import { createLogger } from "../../utils/logger";
import { JwtPayload } from "../../auth/JwtPayload";
import { Jwt } from "../../auth/Jwt";

const logger = createLogger("auth");

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = "https://dev-w0po8u6i.eu.auth0.com/.well-known/jwks.json";

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info("Authorizing a user", event.authorizationToken);
  try {
    const jwtToken = await verifyToken(event.authorizationToken);
    logger.info("User was authorized", jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Allow",
            Resource: "*",
          },
        ],
      },
    };
  } catch (e) {
    logger.error("User not authorized", { error: e.message });

    return {
      principalId: "user",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Action: "execute-api:Invoke",
            Effect: "Deny",
            Resource: "*",
          },
        ],
      },
    };
  }
};

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  logger.info("verifyToken", jwksUrl);
  const token = getToken(authHeader);
  const jwt: Jwt = decode(token, { complete: true }) as Jwt;
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  // Verify using getKey callback
  // Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
  var jwksClient = require("jwks-rsa");
  var client = jwksClient({
    jwksUri: jwksUrl,
  });
  console.log("client", client);

  /*const getKey = await client.getSigningKey(function (err, key) {
    logger.info("key", key);
    if (err) {
      throw new Error("no Key Found");
    }
    return key.publicKey || key.rsaPublicKey;
  });*/

  /* jwt.verify(token, getKey, options, function (err, decoded) {
    console.log(decoded.foo) // bar
  }) */

  const key = await client.getSigningKey(jwt.header.kid);
  const signingKey = key.getPublicKey();
  return verify(
    token, // Token from an HTTP header to validate
    signingKey, // A certificate copied from Auth0 website
    { algorithms: ["RS256"] } // We need to specify that we use the RS256 algorithm
  ) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error("No authentication header");

  if (!authHeader.toLowerCase().startsWith("bearer "))
    throw new Error("Invalid authentication header");

  const split = authHeader.split(" ");
  const token = split[1];

  return token;
}
