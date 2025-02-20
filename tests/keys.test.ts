import chai, { assert } from "chai";
import Sinon from "sinon";
import { mockInvalidCredentials, mockKey } from "./mockResults";
import nock from "nock";
import https from "https";

import { Keys } from "../src/keys";

chai.should();

const fakeCredentials = "testKey:testSecret";
const fakeUrl = "fake.url";
const fakeProjectId = "27e92bb2-8edc-4fdf-9a16-b56c78d39c5b";
const fakeKeyId = "ad9c6799-d380-4db7-8c22-92c20a291229";

describe("Key tests", () => {
  const sandbox = Sinon.createSandbox();

  let requestStub: Sinon.SinonStub;
  let keys: Keys;

  beforeEach(function () {
    requestStub = Sinon.stub(https, "request");
    keys = new Keys(fakeCredentials, fakeUrl);
  });

  afterEach(function () {
    requestStub.restore();
    nock.restore();
    sandbox.restore();
  });

  it("Errors are thrown", function () {
    const expectedError = `DG: ${JSON.stringify(mockInvalidCredentials)}`;

    nock(`https://${fakeUrl}`)
      .get(`/v1/projects/${fakeProjectId}/keys`)
      .reply(200, mockInvalidCredentials);

    keys.list(fakeProjectId).catch((err) => {
      assert.equal(err, expectedError);
    });
  });

  it("Create resolves", function () {
    nock(`https://${fakeUrl}`)
      .post(`/v1/projects/${fakeProjectId}/keys`)
      .reply(200, mockKey);

    keys.create(fakeProjectId, "test Comment", ["member"]).then((response) => {
      response.should.deep.eq(mockKey);
      requestStub.calledOnce.should.eq(true);
    });
  });

  it("Delete resolves", function () {
    nock(`https://${fakeUrl}`)
      .delete(`/v1/projects/${fakeProjectId}/keys/${fakeKeyId}`)
      .reply(200);

    keys.delete(fakeProjectId, fakeKeyId).then(() => {
      requestStub.calledOnce.should.eq(true);
    });
  });
});
