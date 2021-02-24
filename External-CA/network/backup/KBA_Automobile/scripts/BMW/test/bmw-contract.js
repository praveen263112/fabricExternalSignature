/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { BmwContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logging = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('BmwContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new BmwContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"bmw 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"bmw 1002 value"}'));
    });

    describe('#bmwExists', () => {

        it('should return true for a bmw', async () => {
            await contract.bmwExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a bmw that does not exist', async () => {
            await contract.bmwExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createBmw', () => {

        it('should create a bmw', async () => {
            await contract.createBmw(ctx, '1003', 'bmw 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"bmw 1003 value"}'));
        });

        it('should throw an error for a bmw that already exists', async () => {
            await contract.createBmw(ctx, '1001', 'myvalue').should.be.rejectedWith(/The bmw 1001 already exists/);
        });

    });

    describe('#readBmw', () => {

        it('should return a bmw', async () => {
            await contract.readBmw(ctx, '1001').should.eventually.deep.equal({ value: 'bmw 1001 value' });
        });

        it('should throw an error for a bmw that does not exist', async () => {
            await contract.readBmw(ctx, '1003').should.be.rejectedWith(/The bmw 1003 does not exist/);
        });

    });

    describe('#updateBmw', () => {

        it('should update a bmw', async () => {
            await contract.updateBmw(ctx, '1001', 'bmw 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"bmw 1001 new value"}'));
        });

        it('should throw an error for a bmw that does not exist', async () => {
            await contract.updateBmw(ctx, '1003', 'bmw 1003 new value').should.be.rejectedWith(/The bmw 1003 does not exist/);
        });

    });

    describe('#deleteBmw', () => {

        it('should delete a bmw', async () => {
            await contract.deleteBmw(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a bmw that does not exist', async () => {
            await contract.deleteBmw(ctx, '1003').should.be.rejectedWith(/The bmw 1003 does not exist/);
        });

    });

});