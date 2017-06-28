"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase = require("firebase-admin");
const hash = require("object-hash");
let separator = "|";
function isReference(object) {
    if (typeof object.child == 'function') {
        return true;
    }
    else {
        return false;
    }
}
class DatabaseError extends Error {
}
class DatabaseConnection {
    constructor() {
        this.authentication = require("serviceAccountKey.json");
        firebase.initializeApp({
            credential: firebase.credential.cert(this.authentication),
            databaseURL: "https://cryptohaven-299ff.firebaseio.com"
        });
        this.db = firebase.database();
    }
    static instance() {
        if (this.ref == null) {
            this.ref = new DatabaseConnection();
        }
        return this.ref;
    }
    updateTable(model) {
        let t = {};
        let persistent = model.index != "";
        let timestamp = +new Date();
        if (!persistent) {
            let key = this.db.ref().child(model.type).push().key;
            if (key) {
                model.index = key;
            }
            else {
                throw new DatabaseError("Could not acquire key for [" + model.type + "]");
            }
            model.fields["created_at"] = timestamp;
        }
        model.fields["updated_at"] = timestamp;
        t["/" + model.type + "/" + model.index] = model.fields;
        this.db.ref().update(t);
        return model.index;
    }
    database() {
        return this.db;
    }
}
exports.DatabaseConnection = DatabaseConnection;
class Model {
    constructor(attributes, type) {
        this.type = type;
        this.index = "";
        this.attributes = attributes;
        this.hash = hash.MD5(attributes);
    }
    get fields() {
        return this.attributes;
    }
    get timestamp() {
        return this.attributes;
    }
    belongsTo(query_node, query_type, fk) {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'belongsTo' on a non-persistent model");
        if (!fk)
            throw new DatabaseError("Can't call 'belongsTo' with am undefined foreign key");
        return new BelongsTo(query_node, query_type, fk);
    }
    hasMany(query_node, query_type, fk_name) {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasMany' on a non-persistent model");
        return new HasMany(query_node, query_type, "fk_" + fk_name, this.id);
    }
    hasOneThrough(query_node, query_type, target_type) {
        if (!this.isPersistent())
            throw new DatabaseError("Can't call 'hasOneThrough' on a non-persistent model");
        let fks = query_node.split(separator);
        let fk_name_a = "fk_" + fks[0];
        let fk_name_b = "fk_" + fks[1];
        return new HasOneThrough(query_node, query_type, target_type, fk_name_a, fk_name_b, this.id);
    }
    isPersistent() {
        return this.index != "";
    }
    isChanged() {
        this.last_hash = hash.MD5(this.attributes);
        return this.last_hash != this.hash;
    }
    get id() {
        return this.index;
    }
    destroy() {
        if (!this.isPersistent())
            throw new DatabaseError("Can't 'destroy' non-persistent model");
        console.log("/" + this.type + "/" + this.id);
        DatabaseConnection.instance().database().ref(this.type).child(this.id).remove();
    }
    save() {
        if (!this.isPersistent() || this.isChanged()) {
            this.index = DatabaseConnection.instance().updateTable({
                index: this.index,
                fields: this.attributes,
                type: this.type
            });
        }
        this.hash = this.last_hash;
    }
}
exports.Model = Model;
class Finder {
    constructor(nodeName, obj) {
        this.nodeName = nodeName;
        this.obj = obj;
        if (nodeName) {
            this.ref = DatabaseConnection.instance().database().ref().child(nodeName);
        }
    }
    all() {
        return new All(this.ref, this.obj);
    }
    order(field) {
        return new Order(this.ref, this.obj, field);
    }
    byKey(id) {
        return new ByKey(this.ref, this.obj, id);
    }
    byValue(name, value) {
        return new ByField(this.ref, this.obj, name, value);
    }
}
exports.Finder = Finder;
class Node {
    constructor(ref, obj) {
        this.ref = ref;
        this.obj = obj;
    }
    responseNode(callback) {
        this.ref.once("value", (snapshot) => {
            let result = this.obj.constructor.apply(Object.create(this.obj), new Array(snapshot.val()));
            result.index = snapshot.key;
            callback(result);
        });
    }
    responseCollection(callback) {
        this.ref.once("value", (snapshot) => {
            let records = new Array();
            snapshot.forEach((element) => {
                let result = this.obj.constructor.apply(Object.create(this.obj), new Array(element.val()));
                result.index = element.key;
                records.push(result);
            });
            callback(records[0]);
        });
    }
    load(callback) {
        if (isReference(this.ref)) {
            this.responseNode(callback);
        }
        else {
            this.responseCollection(callback);
        }
    }
    destroy() {
        this.load((node) => {
            node.destroy();
        });
    }
}
class ByKey extends Node {
    constructor(ref, obj, id) {
        super(ref, obj);
        if (isReference(this.ref))
            this.ref = this.ref.child(id);
    }
}
class ByField extends Node {
    constructor(ref, obj, name, value) {
        super(ref, obj);
        this.ref = this.ref.orderByChild(name).equalTo(value).limitToLast(1);
    }
}
class BelongsTo extends Node {
    constructor(target_name, obj, fk) {
        super(DatabaseConnection.instance().database().ref().child(target_name), obj);
        this.fk = fk;
        if (isReference(this.ref))
            this.ref = this.ref.child(fk);
    }
}
exports.BelongsTo = BelongsTo;
class HasOneThrough extends Node {
    constructor(middle_name, middle, target, fk_name_a, fk_name_b, fk_a) {
        super(DatabaseConnection.instance().database().ref().child(middle_name), middle);
        this.middle_name = middle_name;
        this.target = target;
        this.fk_name_a = fk_name_a;
        this.fk_name_b = fk_name_b;
        this.fk_a = fk_a;
        this.ref = this.ref.orderByChild(this.fk_name_a).equalTo(fk_a);
    }
    load(callback) {
        super.load((middle) => {
            let target_name = this.middle_name.split(separator)[1];
            let target_key = middle.fields[this.fk_name_b];
            new Finder(target_name, this.target).
                byKey(target_key).
                load(callback);
        });
    }
    set(target) {
        super.load((old_middle) => {
            old_middle.destroy();
            target.save();
            let attributes = {};
            attributes[this.fk_name_a] = this.fk_a;
            attributes[this.fk_name_b] = target.id;
            let new_middle = new Model(attributes, this.middle_name);
            new_middle.save();
        });
    }
}
exports.HasOneThrough = HasOneThrough;
class Collection {
    constructor(ref, obj) {
        this.ref = ref;
        this.obj = obj;
    }
    load(callback) {
        this.ref.once("value", (snapshot) => {
            let records = new Array();
            snapshot.forEach((element) => {
                let result = this.obj.constructor.apply(Object.create(this.obj), new Array(element.val()));
                result.index = element.key;
                records.push(result);
            });
            callback(records);
        });
    }
    destroy_all() {
        this.load((node) => {
            node.forEach(element => {
                element.destroy();
            });
        });
    }
}
class All extends Collection {
    constructor(ref, obj) {
        super(ref, obj);
    }
}
class Order extends Collection {
    constructor(ref, obj, field) {
        super(ref, obj);
        this.ref = this.ref.orderByChild(field);
    }
}
class HasMany extends Collection {
    constructor(target_name, obj, fk_name, fk) {
        super(DatabaseConnection.instance().database().ref().child(target_name), obj);
        this.fk_name = fk_name;
        this.fk = fk;
        this.ref = this.ref.orderByChild(fk_name).equalTo(fk);
    }
    push(node) {
        node.fields[this.fk_name] = this.fk;
        node.save();
    }
}
exports.HasMany = HasMany;
class HasManyThrough extends Collection {
}
exports.HasManyThrough = HasManyThrough;
