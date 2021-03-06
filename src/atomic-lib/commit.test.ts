import { expect } from 'chai';
import { CommitBuilderI, generatePublicKeyFromPrivate, serializeDeterministically, signAt, signToBase64 } from './commit';

describe('Commit', () => {
  const privateKey = 'CapMWIhFUT+w7ANv9oCPqrHrwZpkP2JhzF9JnyT6WcI=';
  const publicKey = '7LsjMW5gOfDdJzK/atgjQ1t20J/rw8MjVg6xwqm+h8U=';
  const agentSubject = 'http://localhost/agents/7LsjMW5gOfDdJzK/atgjQ1t20J/rw8MjVg6xwqm+h8U=';
  const subject = 'https://localhost/new_thing';

  it('creates the right public key', async () => {
    const generatedPublickey = await generatePublicKeyFromPrivate(privateKey);
    expect(generatedPublickey).to.equal(publicKey);
  });

  it('signs a commit with the right signature', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // This output is wrong, but I still want this test to succeed: https://github.com/joepio/atomic-react/issues/3
    const signatureCorrect = 'kLh+mxy/lgFD6WkbIbhJANgRhyu39USL9up1zCmqU8Jmc+4rlvLZwxSlfxKTISP2BiXLSiz/5NJZrN5XpXJ/Cg==';
    const serializedCommitRust =
      '{"https://atomicdata.dev/properties/createdAt":0,"https://atomicdata.dev/properties/isA":["https://atomicdata.dev/classes/Commit"],"https://atomicdata.dev/properties/set":{"https://atomicdata.dev/properties/description":"Some value","https://atomicdata.dev/properties/shortname":"someval"},"https://atomicdata.dev/properties/signature":"kLh+mxy/lgFD6WkbIbhJANgRhyu39USL9up1zCmqU8Jmc+4rlvLZwxSlfxKTISP2BiXLSiz/5NJZrN5XpXJ/Cg==","https://atomicdata.dev/properties/signer":"http://localhost/agents/7LsjMW5gOfDdJzK/atgjQ1t20J/rw8MjVg6xwqm+h8U=","https://atomicdata.dev/properties/subject":"https://localhost/new_thing"}';
    const createdAt = 0;
    const commitbuilder: CommitBuilderI = {
      subject,
      set: {
        'https://atomicdata.dev/properties/description': 'Some value',
        'https://atomicdata.dev/properties/shortname': 'someval',
      },
    };
    const commit = await signAt(commitbuilder, agentSubject, privateKey, createdAt);
    const sig = commit.signature;
    const serialized = serializeDeterministically(commit);
    expect(serialized).to.equal(serializedCommitRust);
    expect(sig).to.equal(signatureCorrect);
  });

  it('signs any string correctly', async () => {
    const input = 'val';
    const correct_signature_rust = 'YtDR/xo0272LHNBQtDer4LekzdkfUANFTI0eHxZhITXnbC3j0LCqDWhr6itNvo4tFnep6DCbev5OKAHH89+TDA==';
    const signature = await signToBase64(input, privateKey);
    expect(signature).to.equal(correct_signature_rust);
  });
});
