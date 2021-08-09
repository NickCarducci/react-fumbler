Just put what is in path(__dirname, src, index.js) in for now, as I figure out
babel config
# Fumbler, your RSA encryption suite for firebase-firestore (in React)!

The reliability of this relies on cors so that no private key-modulo, off-local-storage is required.

### find your account key thru device-to-device RSA boxes

LICENSE AGPL-3
No redistribution but for strategy of parts, unless retributed

how to use, Chats: create a public and private user data collection [users,userDatas] or whatever

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

    const deletion = async (_id, db) => {
      console.log("deleting");
      console.log(_id);
      await db
        .remove(_id)
        .then(() => {
          db.destroy().then(() => console.log("destoyed"));
        })
        .catch(standardCatch);
    };
    //const destroy = (db) => db.destroy();
    const set = async (db, c) =>
      //!c._id
      //? console.log("pouchdb needs ._id key:value: JSON.parse= " + JSON.parse(c))
      await db //has upsert plugin from class constructor
        .upsert(c._id, (c) => {
          var copy = { ...c }; //pouch-db \(construct, protocol)\
          return copy; //return a copy, don't displace immutable object fields
        })
        .then(
          () => console.log("saved successful") /*"success"*/
          /** or
                  notes.find((x) => x._id === c._id)
                    ? this.db
                      .post(c)
                      .then(() => null)
                      .catch(standardCatch)
                  : deletion(c) && set(db, c);  
                  */
        )
        .catch(standardCatch);
    const read = async (db, notes /*={}*/) =>
      //let notes = {};
      await db
        .allDocs({ include_docs: true })
        .then(
          (
            allNotes //new Promise cannot handle JSON objects, Promise.all() doesn't
          ) =>
            Promise.all(
              allNotes.rows.map(async (n) => await (notes[n.doc.key] = n.doc))
            )
          // && and .then() are functionally the same;
        )
        .catch(standardCatch);

    const optsForPouchDB = {
      //auto_compaction: true //zipped...
    };
    class DDB {
      constructor(name) {
        PouchDB.plugin(upsert);
        const title = "deviceName";
        this.db = new PouchDB(title, optsForPouchDB);
      }
      deleteDeviceName = async (note) =>
        await this.db.remove(note).catch(standardCatch);

      destroy = () => destroy(this.db);
      storeDeviceName = (key) => set(this.db, key);
      readDeviceName = async (notes = {}) =>
        //let notes = {};
        await read(this.db, notes);
    }

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
      componentDidMount = () =>{ 
        await this.state.rsaPrivateKeys
          .readPrivateKeys()
          .then(async (keysOutput) => {
            const keyBoxes = Object.values(keysOutput);
            if (keyBoxes) {
              const accountBox = keyBoxes.find(
                (x) => x._id === this.props.auth.uid
              );
              this.setState({user:{...this.state.user, key: accountBox.key, box: accountBox}})
      }
      handleKeysForRoom = (room) => {
        const { recipientsProfiled, threadId, user } = this.props;
        const { rsaPrivateKeys } = this.state;
        const rooms = firebase.firestore().collection("rooms");
        roomKeys(room, rsaPrivateKeys, threadId, recipientsProfiled, rooms, user);
      };
      componentDidUpdate = prevProps => {
        if(this.props.room!==prevProps.room){
            /*
            room = {
              id: collection + doc.id,
              ["saltedKeys" + userId]: roomKeyInBox,
              ...,
              ["saltedKeys" + userId]: roomKeyInBox
            }
            */
            const{room}=this.props
            const roomKey = room["saltedKey" + this.props.auth.uid]
            this.setState({roomKey},()=>{
              let p = 0
              let chats = []
              this.props.chats.map(async x=>{
                p++
                var foo = {...x}
                const message = await rsa
                  .decrypt(x.message, user.key, "SHA-256", {
                    name: "RSA-PSS"
                  })
                if(message){
                  foo.message = message
                  chats.push(foo)
                }
              })
              if(p===this.props.chats.length){
                this.setState({chats})
              }
            })
        }
      }
      allowDeviceToRead = async () => {
        const { auth } = this.props;
        if (auth !== undefined) {
          const userDatas = firebase
            .firestore()
            .collection("userDatas")
            .doc(auth.uid);
          const userUpdatable = firebase
            .firestore()
            .collection("users")
            .doc(auth.uid);
          const devices = firebase.firestore().collection("devices");
          console.log("FUMBLER");

          if (!this.state.deviceName)
            return window.alert(`please choose a device name`);
          const authorId = auth.uid;
          await fumbler(
            userUpdatable,
            userDatas,
            devices,
            this.state.deviceName,
            authorId
          )
            .then((o) => {
              const obj = o && JSON.parse(o);
              if (obj) {
                if (obj.fumblingComplete) {
                  this.props.setToUser({
                    key: obj.accountBox.key,
                    devices: obj.devices
                  });
                }
              } else if (obj === "awaitingAuthMode")
                this.setState(
                  {
                    standbyMode: true
                  },
                  () =>
                    window.alert(
                      "STANDBY: Please login to " +
                        (user.authorizedDevices.length > 1
                          ? "another one of "
                          : "") +
                        `your previous (${user.authorizedDevices.length}) device${
                          user.authorizedDevices.length > 1 ? "s" : ""
                        }, then come back.`
                    )
                );
            })
            .catch(standardCatch);
        } else window.alert("login you must");
      };
      manuallyDeleteKeyBox = async (keybox) => {
        const devices = firebase.firestore().collection("devices");
        deleteFumbledKeys(keybox, devices);
      };
      return <div>
        <Chatter
          handleKeysForRoom={()=>{
            const room = this.props.room ? this.props.room : {id:this.state.threadId}
            /*
            room = {
              id: collection + doc.id,
              ["saltedKeys" + userId]: roomKeyInBox,
              ...,
              ["saltedKeys" + userId]: roomKeyInBox
            }
            */
            this.handleKeysForRoom(room)
          }}
          standbyMode={standbyMode}
          allowDeviceToRead={this.allowDeviceToRead}
          manuallyDeleteKeyBox={this.manuallyDeleteKeyBox}
        />

         
        <Vintages
          show={
            (!this.stream && openFolder && this.state.openFrom === "Folder") ||
            this.stream
          }
          auth={this.props.auth}
          setNapkin={this.props.setNapkin}
          user={this.props.user}
          vintageOfKeys={this.props.vintageOfKeys}
          deviceCollection={firebase.firestore().collection("devices")}
          userUpdatable={
            this.props.auth !== undefined &&
            firebase.firestore().collection("users").doc(this.props.auth.uid)
          }
          userDatas={
            this.props.auth !== undefined &&
            firebase
              .firestore()
              .collection("userDatas")
              .doc(this.props.auth.uid)
          }
        />

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
