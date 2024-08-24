export async function createToken(_id: string) {
  // Base64 encode the header
  const header = btoa(JSON.stringify({ typ: "JWT", alg: "HS256" }));

  // Base64 encode the payload
  const payload = btoa(JSON.stringify({ _id }));

  // Concatenate the encoded header, payload, and a period character
  const encodedToken = `${header}.${payload}.`;

  // Sign the token using HMAC-SHA256
  const secret = process.env.COOKIE_SECRET; // Replace this with your own secret key
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  const encodedTokenArray = encoder.encode(encodedToken);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encodedTokenArray
  );

  const signature = btoa(
    //@ts-ignore
    String.fromCharCode.apply(null, new Uint8Array(signatureBuffer))
  );

  // Concatenate the encoded token and the signature
  const token = `${encodedToken}${signature}`;

  return token;
}

export async function verifyToken(token: string) {
  // Split the token into its components: header, payload, and signature

  if(!token) return {_id:""};


  const [encodedHeader, encodedPayload, signature] = token.split(".");

  // Base64 decode the header and payload
  const decodedHeader = atob(encodedHeader);
  const decodedPayload = atob(encodedPayload);

  // Parse the JSON in the header and payload
  const header = JSON.parse(decodedHeader);
  const payload = JSON.parse(decodedPayload);

  // Concatenate the encoded header and payload with a period character to form the unsigned token
  const unsignedToken = `${encodedHeader}.${encodedPayload}.`;

  // Sign the unsigned token using HMAC-SHA256
  const secret = process.env.COOKIE_SECRET; // Replace this with your own secret key
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["verify"]
  );
  const encodedTokenArray = encoder.encode(unsignedToken);

  const signatureBuffer = new Uint8Array(
    //@ts-ignore
    Array.prototype.map.call(atob(signature), (char) => char.charCodeAt(0))
  );
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBuffer,
    encodedTokenArray
  );

  if (isValid) {
    return payload;
  } else {
    return {_id:""};
  }
}
