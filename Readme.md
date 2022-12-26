#Thanks for checking out, something's amiss, hold on... this is new

Just put what is in path(__dirname, src, index.js) in for now, as I figure out
babel config
# Fumbler, your RSA encryption suite for firebase-firestore (in React)!

![alt text](https://www.dropbox.com/s/spk5p2uu7xs7vj3/fumbler%20%281%29.png?dl=0 "react-fumbler key-loop(array) & O.K.!")

The reliability of this relies on cors so that no private key-modulo, off-local-storage is required.

### find your account key thru device-to-device RSA boxes

LICENSE AGPL-3
No redistribution but for strategy of parts, unless retributed

how to use, Chats: create a public and private user data collection [users,userDatas] or whatever

TO DO: update read me to v9 firestore

    /*
    userDatas = {
      pendingDeviceBoxes: firebase.firestore.FieldValue.arrayRemove(
        accountBox.box
      ),
      key: user["deviceBox" + deviceBox.box]: ,
      ["deviceBox" + deviceBox]: rsa.encrypt(
        accountBox.key,
        deviceBox,
        "SHA-256",
        {
          name: "RSA-PSS"
        }
      )
    }
    keybox = {
      key: privateKey,
      box: publicKey
    }
    */
    addUserDatas = (meAuth) => {
        const users = firebase.firestore().collection("users");
        users.doc(meAuth.uid).onSnapshot((doc) => {
            if (doc.exists) {
                var userDatas = doc.data();
                user.id = doc.id
                const userDatas = firebase.firestore().collection("userDatas");
                userDatas.doc(meAuth.uid).onSnapshot((doc) => {
                    if (doc.exists) {
                        var userDatas = doc.data();
                        this.setState(
                            {
                                user: { ...user, ...userDatas }
                            },
                            () => this.getEntities(meAuth)
                        );
                    }
                }, standardCatch);
            }
        }, standardCatch);
    };
    import React from "react";
    import PouchDB from "pouchdb";
    import upsert from "pouchdb-upsert";
    import rsa from "js-crypto-rsa";

    const standardCatch = (err) => console.log(err.message);
    const arrayMessage = (message) =>
        message
            .toLowerCase()
            //capture or, excluding set, match 2 or more of the preceding token
            .replace(/((\r\n|\r|\n)+[^a-zA-Z]+_+[ ]{2,})+/g, " ")
            .split(" ");
    const specialFormatting = (x, numbersOk) =>
        x
            .toLowerCase()
            //replace or regex a-z or A-Z includes space whitespace
            .replace(!numbersOk ? /[^a-zA-Z,']+/g : /[^a-zA-Z0-9,']+/g, " ")
            .split(" ")
            .map((word) => {
                var end = word.substring(1);
                if (word.includes("'")) {
                    var withapos = word.lastIndexOf("'");
                    var beginning = word.substring(1, withapos);
                    if (beginning.length === 1) {
                        end =
                            beginning +
                            "'" +
                            word.charAt(withapos + 1).toUpperCase() +
                            word.substring(withapos + 2);
                    }
                }
                var resword = word.charAt(0).toUpperCase() + end;
                return ["Of", "And", "The"].includes(resword)
                    ? resword.toLowerCase()
                    : arrayMessage(resword).join(" ");
            })
            .join(" ");


    class RSA {
        //Key-Box device query Asymmetric-Encryption
        constructor(name) {
            PouchDB.plugin(upsert);
            const title = "rsaPrivateKeys";
            this.db = new PouchDB(title, {});
        }
        deleteKey = async (_id) =>
            await this.db
                .remove(_id)
                .then(() => {
                    this.db.destroy().then(() => console.log("destoyed"));
                })
                .catch(standardCatch);
        //deleteKeys = async () => await destroy(this.db);
        setPrivateKey = async (c) =>
            await this.db //has upsert plugin from class constructor
                .upsert(c._id, (c) => {
                    var copy = { ...c }; //pouch-db \(construct, protocol)\
                    return copy; //return a copy, don't displace immutable object fields
                });
        readPrivateKeys = async (notes = {}) =>
            //let notes = {};
            await this.db
                .allDocs({ include_docs: true })
                .then(
                    (allNotes) => {
                        return allNotes.rows.map((n) => (notes[n.doc.key] = n.doc));
                    }
                    // && and .then() are functionally the same;
                )
                .catch(standardCatch);
    }

    class DDB {
        constructor(name) {
            PouchDB.plugin(upsert);
            const title = "deviceName";
            this.db = new PouchDB(title, {
                //revs_limit: 1, //revision-history
                //auto_compaction: true //zipped...
            });
        }
        deleteDeviceName = async (_id) =>
            await this.db
                .remove(_id)
                .then(() => {
                    this.db.destroy().then(() => console.log("destoyed"));
                })
                .catch(standardCatch);

        destroy = () => this.db.destroy().then(() => console.log("destoyed"));
        storeDeviceName = async (c) =>
            await this.db //has upsert plugin from class constructor
                .upsert(c._id, (c) => {
                    var copy = { ...c }; //pouch-db \(construct, protocol)\
                    return copy; //return a copy, don't displace immutable object fields
                });
        readDeviceName = async (notes = {}) =>
        //let notes = {};
        {
            return await this.db
                .allDocs({ include_docs: true })
                .then(
                    (allNotes) => {
                        return allNotes.rows.map((n) => (notes[n.doc.key] = n.doc));
                    }
                    // && and .then() are functionally the same;
                )
                .catch(standardCatch);
        };
    }
    const firestore = getFirestore(firebase);// new firestore v9
    class Chats extends React.Component {
        constructor(props) {
            super(props);
            let ddb = new DDB();
            this.state = {
                ddb,
                rsaKeys: [],
                chats: []
            keyBoxes,
                standbyMode
            };
        }
        updateVintageCollection = () =>
          this.setState({
            deviceCollection: firebase.firestore().collection("devices"),
            userUpdatable: firebase
              .firestore()
              .collection("users")
              .doc(this.props.auth.uid),
            userDatas: firebase
              .firestore()
              .collection("userDatas")
              .doc(this.props.auth.uid)
          });
        handleKeysForRoom = (room) => {
            const { recipientsProfiled, threadId, user } = this.props;
            const { rsaPrivateKeys } = this.state;
            const rooms = firebase.firestore().collection("rooms");
            this.props.getRoomKeys(
                room,
                rsaPrivateKeys,
                threadId,
                recipientsProfiled,
                rooms,
                user
            );
        };
        componentDidUpdate = (prevProps) => {
            if (auth !== prevProps.auth)
              auth !== undefined && this.updateVintageCollection();
            if (
                this.props.user !== undefined &&
                this.props.user.key &&
                this.props.recentChats &&
                this.props.recipientsProfiled &&
                this.props.recipientsProfiled.length > 0 &&
                this.props.recipientsProfiled.length === this.props.recipients.length &&
                this.state.room &&
                this.state.room !== this.state.lastRoom
            ) {
                this.handleKeysForRoom(this.state.room);
                this.setState({ lastRoom: this.state.room }, () => {
                    const { room } = this.state;

                    /*
                    room = {
                      id: collection + doc.id,
                      ["saltedKeys" + userId]: roomKeyInBox,
                      ...,
                      ["saltedKeys" + userId]: roomKeyInBox
                    }
                    */
                    const roomKey = room["saltedKey" + this.props.auth.uid];
                    this.setState({ roomKey }, () => {
                        let p = 0;
                        let chats = [];
                        this.props.recentChats.map(async (x) => {
                            p++;
                            var foo = { ...x };
                            const message = await rsa.decrypt(
                                x.message,
                                this.props.user.key,
                                "SHA-256",
                                {
                                    name: "RSA-PSS"
                                }
                            );
                            if (message) {
                                foo.message = message;
                                chats.push(foo);
                            }
                        });
                        if (p === this.props.recentChats.length) {
                            this.setState({ chats });
                        }
                    });
                });
            }
            return <div>
                <Chatter
                    getRoomKeys={this.props.getRoomKeys}
                />
                {/*(() => console.log("go"))()*/}
                {this.props.auth === undefined ? (
                    "Login to forge vintages"
                ) : this.state.deviceCollection ? (
                    <Vintages
                      firestore={firestore} //new firestore v9
                        Vintages={this.props.Vintages}
                        rsaPrivateKeys={this.state.rsaPrivateKeys}
                        ddb={this.state.ddb}
                        show={
                            true
                            /*(!this.stream &&
                            openFolder &&
                            this.state.openFrom === "Folder") ||
                          this.stream*/
                        }
                        auth={this.props.auth}
                        setParentState={this.props.setNapkin}
                        user={this.props.user}
                        vintageOfKeys={this.props.vintageOfKeys}
                        deviceCollection={this.state.deviceCollection}
                        userUpdatable={this.state.userUpdatable}
                        userDatas={this.state.userDatas}
                    />
                ) : (
                            "loading keys after login"
                        )}
            </div>

how to use, Files

    class Files extends React.Component {
        constructor(props) {
            super(props);
            let rsaPrivateKeys = new RSA();
            this.state = {
                rsaPrivateKeys,
                videos: []
            };
        }
        componentDidUpdate = async (prevProps) => {
            if (
                this.props.auth !== undefined &&
                this.props.videos !== [] &&
                this.props.videos !== prevProps.videos
            ) {
                await this.state.rsaPrivateKeys
                    .readPrivateKeys()
                    .then(async (keysOutput) => {
                        const keyBoxes = Object.values(keysOutput);
                        if (keyBoxes) {
                            let p = 0;
                            let videos = [];
                            const accountBox = keyBoxes.find(
                                (x) => x._id === this.props.auth.uid
                            );
                            this.props.videos.map(async (x) => {
                                p++;
                                var foo = { ...x };
                                var readFile = new FileReader();
                                await fetch(x.gsUrl, {
                                    "Access-Control-Allow-Origin": "*"
                                })
                                    .then((blob) => blob.blob())
                                    .then((img) => {
                                        if (!/image/.test(img.type)) {
                                            return null; //not an image
                                        }

                                        readFile.readAsDataURL(img);
                                        /*var reader = new FileReader();
                                  reader.readAsArrayBuffer(img);
                                  FileReader.readAsDataURL:
                                  "returns base64 that contains many characters, 
                                  and use more memory than blob url, but removes
                                  from memory when you don't use it (by garbage collector)"*/
                                    })
                                    .catch((err) =>
                                        this.setState(
                                            {
                                                Errorf: err.message,
                                                Photo: null
                                            },
                                            () => console.log("REACT-LOCAL-PHOTO: " + err.message)
                                        )
                                    );

                                //readFile.onerror = (err) => console.log(err.message);
                                readFile.onloadend = (reader) => {
                                    this.setState({ readFile }, async () => {
                                        if (reader.target.readyState === 2) {
                                            const gsUrl = await rsa.decrypt(
                                                reader.target.result,
                                                accountBox.key,
                                                "SHA-256",
                                                {
                                                    name: "RSA-PSS"
                                                }
                                            );
                                            if (gsUrl) {
                                                foo.gsUrl = gsUrl;
                                                videos.push(foo);
                                            }
                                        }
                                    });
                                };
                            });
                            if (p === this.props.videos.length) this.setState({ videos });
                        }
                    });
            }
        };

SEE LICENSE IN LICENSE.lz.txt

copying the src code? https://github.com/npm/cli/issues/3514
npm install --force npm uninstall @babel/polyfill --save ...