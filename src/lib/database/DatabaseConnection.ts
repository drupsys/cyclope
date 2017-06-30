import * as firebase from 'firebase-admin'

export type Reference = firebase.database.Reference
export type Query = firebase.database.Query
export type Snapshot = firebase.database.DataSnapshot

export interface IModel {
    index: string
    type: string
    fields: { [key: string]: any }
}

export class DatabaseError extends Error {}

export class DatabaseConnection {
    private static ref: DatabaseConnection = null
    private static app_name: string = "default"
    private static service_key: string = ""
    private static firebase_url: string = ""

    private db: firebase.database.Database

    private constructor(){
        firebase.initializeApp({
            credential:  firebase.credential.cert(require(DatabaseConnection.service_key)),
            databaseURL: DatabaseConnection.firebase_url
        }, DatabaseConnection.app_name)

        this.db = firebase.database()
    }

    public static setup(app: string, service_key: string, firebase_url: string): void {
        DatabaseConnection.app_name = app
        
        if (service_key != "")
            DatabaseConnection.service_key = service_key + ".json"
        else
            DatabaseConnection.service_key = ""
    
        DatabaseConnection.firebase_url = firebase_url
        DatabaseConnection.ref = null;
    }

    public static instance(): DatabaseConnection {
        if (DatabaseConnection.service_key == "")
            throw new DatabaseError("Sevice key is not set, call DatabaseConnection.setup(service_key, firebase_url)")

        if (DatabaseConnection.firebase_url == "")
            throw new DatabaseError("Database url is not set, call DatabaseConnection.setup(service_key, firebase_url)")

        if (DatabaseConnection.ref == null) {
            DatabaseConnection.ref = new DatabaseConnection();
        }

        return DatabaseConnection.ref;
    }

    public updateTable(model: IModel, completed?: ((e: Error|null) => any)): string {
        let t: { [key: string]: { [key: string]: any } } = {};
        let persistent = model.index != ""
        let timestamp = + new Date()

        if (!persistent) {
            let key = this.db.ref().child(model.type).push().key
            if (key) {
                model.index = key
            } else {
                throw new DatabaseError("Could not acquire key for [" + model.type + "]");
            }
            
            model.fields["created_at"] = timestamp
        }

        model.fields["updated_at"] = timestamp
        t["/" + model.type + "/" + model.index] = model.fields
        this.db.ref().update(t, completed)

        return model.index
    }

    public database(): firebase.database.Database {
        return this.db
    }
}