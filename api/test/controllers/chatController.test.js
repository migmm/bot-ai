// test/controllers/chatController.test.js

import * as chai from 'chai';
import sinon from 'sinon';
import { getChatHistory } from '../../controllers/chatController.js';
import Chat from '../../models/Chat.js';

const { expect } = chai;

describe('ChatController', () => {
    describe('getChatHistory', () => {
        it('should return chat history for a customer', async () => {
            const mockChat = { customerId: '123', messages: ['Hello', 'Hi'] };
            const findOneStub = sinon.stub(Chat, 'findOne').resolves(mockChat);

            const req = {
                params: { customerId: '123' }
            };
            const res = {
                json: sinon.stub(),
                status: sinon.stub().returnsThis()
            };

            await getChatHistory(req, res);

            expect(findOneStub.calledOnce).to.be.true;
            expect(res.json.calledWith(mockChat.messages)).to.be.true;

            findOneStub.restore();
        });

        it('should return 404 if chat not found', async () => {
            const findOneStub = sinon.stub(Chat, 'findOne').resolves(null);

            const req = {
                params: { customerId: '123' }
            };
            const res = {
                json: sinon.stub(),
                status: sinon.stub().returnsThis()
            };

            await getChatHistory(req, res);

            expect(findOneStub.calledOnce).to.be.true;
            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWith({ error: 'Chat not found' })).to.be.true;

            findOneStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findOneStub = sinon.stub(Chat, 'findOne').rejects(new Error('Database error'));

            const req = {
                params: { customerId: '123' }
            };
            const res = {
                json: sinon.stub(),
                status: sinon.stub().returnsThis()
            };

            await getChatHistory(req, res);

            expect(findOneStub.calledOnce).to.be.true;
            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWith({ error: 'Internal server error' })).to.be.true;

            findOneStub.restore();
        });
    });
});