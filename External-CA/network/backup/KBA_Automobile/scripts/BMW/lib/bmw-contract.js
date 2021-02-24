/*
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";
const ClientIdentity = require("fabric-shim").ClientIdentity;
const { Contract, stub } = require("fabric-contract-api");
const shim = require("fabric-shim");

class BmwContract extends Contract {
    async bmwExists(ctx, bmwVin) {
        const buffer = await ctx.stub.getState(bmwVin);
        return !!buffer && buffer.length > 0;
    }

    async addBMW(ctx, bmwVin, make, model, color, DOM, flag) {
        let logger = shim.newLogger("Chaincode --> ");
        let CID = new ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : " + mspID);
        if (mspID == "ManufacturerMSP") {
            const exists = await this.bmwExists(ctx, bmwVin);
            if (exists) {
                throw new Error(
                    `A car with VIN number:${bmwVin} already exists`
                );
            }
            const asset = {
                make,
                model,
                color,
                DOM,
                status: "in Factory",
                flag,
                dealerName: "not assigned"
            };
            const buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(bmwVin, buffer);
            let addCarEvent = {
                Type: "car creation",
                Model: model
            };
            await ctx.stub.setEvent(
                "addCarEvent",
                Buffer.from(JSON.stringify(addCarEvent))
            );
            return JSON.stringify(asset);
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }

    async readBmw(ctx, bmwVin) {
        const exists = await this.bmwExists(ctx, bmwVin);
        if (!exists) {
            throw new Error(`A car with VIN number: ${bmwVin} does not exist`);
        }
        const buffer = await ctx.stub.getState(bmwVin);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async deleteBmw(ctx, bmwVin) {
        let logger = shim.newLogger("-->");

        let CID = new ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : " + mspID);
        if (mspID == "ManufacturerMSP") {
            const exists = await this.bmwExists(ctx, bmwVin);
            if (!exists) {
                throw new Error(
                    `Unable to delete since car with VIN Number: ${bmwVin} does not exist`
                );
            }
            await ctx.stub.deleteState(bmwVin);
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }
    async ordExists(ctx, ordNum) {
        const buffer = await ctx.stub.getState(ordNum);
        return !!buffer && buffer.length > 0;
    }

    async raiseOrder(ctx, ordNum, make, model, color, dealerName) {
        let logger = shim.newLogger("-->");
        let CID = new ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : " + mspID);
        if (mspID == "DealerMSP") {
            const exists = await this.ordExists(ctx, ordNum);
            if (exists) {
                throw new Error(
                    `An unmet order with same number:${ordNum} already exists`
                );
            }
            const asset = { ordNum, make, model, color, dealerName };
            const buffer = Buffer.from(JSON.stringify(asset));
            await ctx.stub.putState(ordNum, buffer);
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }

    async readOrder(ctx, ordNum) {
        const exists = await this.ordExists(ctx, ordNum);
        if (!exists) {
            throw new Error(`An order with number: ${ordNum} does not exist`);
        }
        const buffer = await ctx.stub.getState(ordNum);
        const orderdetails = JSON.parse(buffer.toString());
        return orderdetails;
    }
    async deleteOrd(ctx, ordNum) {
        let logger = shim.newLogger("-->");
        let mspID = CID.getMSPID();
        let CID = new ClientIdentity(ctx.stub);
        logger.info("MSPID : " + mspID);
        if (mspID == "DealerMSP") {
            const exists = await this.ordExists(ctx, ordNum);
            if (!exists) {
                throw new Error(
                    `Unable to delete since car with VIN Number: ${ordNum} does not exist`
                );
            }
            return await ctx.stub.deleteState(ordNum);
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }
    async matchOrder(ctx, ordNum, bmwVin) {
        let logger = shim.newLogger("-->");
        let CID = new ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : " + mspID);
        if (mspID == "ManufacturerMSP") {
            const exists = await this.bmwExists(ctx, bmwVin);
            if (!exists) {
                throw new Error(
                    `A car with VIN number: ${bmwVin} does not exist`
                );
            }
            const orderexists = await this.ordExists(ctx, ordNum);
            if (!exists) {
                throw new Error(
                    `Such an order with number: ${ordNum} does not exist`
                );
            }
            const carBuffer = await ctx.stub.getState(bmwVin);
            const orderBuffer = await ctx.stub.getState(ordNum);
            const ordDetail = JSON.parse(orderBuffer.toString());
            const carDetail = JSON.parse(carBuffer.toString());

            if (
                ordDetail.make === carDetail.make &&
                ordDetail.model === carDetail.model &&
                ordDetail.color === carDetail.color
            ) {
                //return("order matched")
                carDetail.dealerName = ordDetail.dealerName;
                carDetail.status = "Assigned to dealer";
                carDetail.flag = 1;
                const newbuffer = Buffer.from(JSON.stringify(carDetail));
                await ctx.stub.putState(bmwVin, newbuffer);
                return await this.deleteOrd(ctx, ordNum);
            }
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }
    async registerCar(ctx, bmwVin, ownName, plateNum) {
        let mspID = CID.getMSPID();
        logger.info("MSPID : " + mspID);
        let CID = new ClientIdentity(ctx.stub);
        if (mspID == "MvdMSP") {
            const carBuffer = await ctx.stub.getState(bmwVin);
            const carDetail = JSON.parse(carBuffer.toString());
            const stat =
                "Registered to: " + ownName + "with plate number: " + plateNum;
            carDetail.status = stat;
            carDetail.flag = "on the road";
            const newbuffer = Buffer.from(JSON.stringify(carDetail));
            return await ctx.stub.putState(bmwVin, newbuffer);
        } else {
            logger.info(
                "Users Under The Following MSP : " +
                    mspID +
                    " Cannot Perform This Action"
            );
            return (
                "Users Under The Following MSP : " +
                mspID +
                " Cannot Perform This Action"
            );
        }
    }
}

module.exports = BmwContract;
