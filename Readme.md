Just put what is in path(__dirname, src, index.js) in for now, as I figure out
babel config
# Fumbler, your RSA encryption suite for firebase-firestore (in React)!

### find your account key thru device-to-device RSA boxes

LICENSE AGPL-3
No redistribution but for strategy of parts, unless retributed

how to use, Chats: create a public and private user data collection [users,userDatas] or whatever
    
    import React from "react";
    import rsa from "js-crypto-rsa";

    const deletion = (d, db) => db.remove(d).catch(standardCatch);
    const destroy = (db) => db.destroy();
    const set = (db, c) =>
      !c._id
        ? window.alert(
            "pouchdb needs ._id key:value: JSON.parse= " + JSON.parse(c)
          ) &&
          db
            .destroy()
            .then(() => null)
            .catch(standardCatch)
        : db //has upsert plugin from class constructor
            .upsert(c._id, (copy) => {
              copy = { ...c }; //pouch-db \(construct, protocol)\
              return copy; //return a copy, don't displace immutable object fields
            })
            .then(
              () => null /*"success"*/
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
      revs_limit: 1, //revision-history
      auto_compaction: true //zipped...
    };
    class RSA {
      //Key-Box device query Asymmetric-Encryption
      constructor(name) {
        PouchDB.plugin(upsert);
        const title = "rsaPrivateKeys";
        this.db = new PouchDB(title, optsForPouchDB);
      }
      deleteKey = (keybox) => deletion(keybox, this.db);

      //deleteKeys = async () => await destroy(this.db);
      setPrivateKey = (key) => set(this.db, key);
      readPrivateKeys = async (notes = {}) =>
        //let notes = {};
        await read(this.db, notes);
    }
    class App extends React.Component {
      constructor(props) {
        super(props);
        let rsaPrivateKeys = new RSA();
        this.state = {
          rsaPrivateKeys,
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
      return 
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
          allowDeviceToRead={() => {
            if (user !== undefined && auth !== undefined) {
              const userDatas = firebase.firestore().collection("userDatas");
              const users = firebase.firestore().collection("users");
              const devices = firebase.firestore().collection("devices");
              fumbler(auth, user, rsaPrivateKeys, userDatas, users, devices)
                .then((obj) => {
                  if (obj) {
                    if (obj.fumblingComplete) {
                      this.props.showChats();
                      this.props.setToUser({
                        key: obj.accountBox.key,
                        devices: obj.devices
                      });
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
                              `your previous (${
                                user.authorizedDevices.length
                              }) device${
                                user.authorizedDevices.length > 1 ? "s" : ""
                              }, then come back.`
                          )
                      );
                  }
                })
                .catch(standardCatch);
            } else window.alert("login you must");
          }}
          manuallyDeleteKeyBox={(keybox) => {
            var keyboxResult = keyBoxes.find((x) => x.box === keybox.box);
            if (keyboxResult)
              firebase
                .firestore()
                .collection("devices")
                .doc(keybox.id)
                .delete()
                .then(() =>
                  this.state.rsaPrivateKeys
                    .deleteKey(keyboxResult)
                    .then(() => {
                      console.log("deleted plan from local " + keybox.id);
                      //this.getNotes();
                    })
                    .catch((err) => console.log(err.message))
                )
                .catch((err) => console.log(err.message));
          }}

how to use, Files

    class Files extends React.Component {
      constructor(props) {
        super(props);
        let rsaPrivateKeys = new RSA();
        this.state = {
          swipe: "grid",
          chosenHighlight: "",
          int: 3,
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
