// Reference mocha-typescript's global definitions:
/// <reference path="../../../definitions.d.ts" />

import * as $ from 'chai'
import * as sinon from 'sinon'
import * as db from '../../../lib/database'

import { NodeA } from "./models"

let bin = "../../../bin/"
let app = "[DEFAULT]"

@suite("Database")
class Database {

    static before() {
        db.DatabaseConnection.setup(app, bin + "test_key", "https://test-platform-9f2d0.firebaseio.com/")
    }

    @test "should make a new connection the first time instance is called" () {
        $.expect(db.DatabaseConnection.instance().database()).to.be.ok
    }

    @test "should maintain connection across multiple instance() calls" () {
        let dbold = db.DatabaseConnection.instance()
        let dbnew = db.DatabaseConnection.instance()

        $.expect(dbold === dbnew).to.be.true
    }

    @test "should reset reference if setup() is called" () {
        let dbold = db.DatabaseConnection.instance()
        db.DatabaseConnection.setup("second", bin + "test_key", "https://test-platform-9f2d0.firebaseio.com/")
        let dbnew = db.DatabaseConnection.instance()

        $.expect(dbold !== dbnew).to.be.true
    }

    @test "should throw an exception if service key is not provided" () {
        db.DatabaseConnection.setup(app, "", "https://test-platform-9f2d0.firebaseio.com/")
        $.expect(db.DatabaseConnection.instance).to.throw(db.DatabaseError)
    }

    @test "should throw an exception if firebase database is not provided" () {
        db.DatabaseConnection.setup(app, "test_key", "")
        $.expect(db.DatabaseConnection.instance).to.throw(db.DatabaseError)
    }

}

let first: NodeA
let last: NodeA

@suite("Firebase", timeout(5000), slow(1000))
class Firebase {

    static before(done) {
        db.DatabaseConnection.setup("third", bin + "test_key", "https://test-platform-9f2d0.firebaseio.com/")
    
        first = new NodeA({ name: "yolo" })
        first.save()

        last = new NodeA({ name: "yolo" })
        last.save((e: Error): void => {
            done()
        })

    }

    @test "should be possible to get the first record in table" (done) {
        NodeA.find().first().load((node: NodeA): void => {
            $.expect(node.id).to.eq(first.id)
            done()
        })
    }

    @test "should be possible to get the last record in table" (done) {
        NodeA.find().last().load((node: NodeA): void => {
            $.expect(node.id).to.eq(last.id)
            done()
        })
    }

    @test "should save node record persistently" (done) {
        let callback = sinon.spy()
        let a = new NodeA({ name: "yolo" })
        a.save((e: Error | null): void => {
            $.expect(e).to.be.null
            done()
        })
    }

    @test "should be posible to remove a node record permanently" (done) {
        NodeA.find().first().destroy((e: Error): void => {
            NodeA.find().all().load((nodes: NodeA[]): void => {
                $.expect(nodes.length).to.eq(2)
                done()
            })
        })
    }

    //TODO other tests

    @test "should be posible to remove all node records permanently" (done) {
        NodeA.find().all().destroy_all((e: Error): void => {
            NodeA.find().all().load((nodes: NodeA[]): void => {
                $.expect(nodes.length).to.eq(0)
                done()
            })
        })
    }

}