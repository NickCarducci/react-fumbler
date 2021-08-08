import firebase from "firebase/app";
import "firebase/firestore";
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
class RSA {
  //Key-Box device query Asymmetric-Encryption
  constructor(name) {
    PouchDB.plugin(upsert);
    const title = "rsaPrivateKeys";
    this.db = new PouchDB(title, optsForPouchDB);
  }
  deleteKey = async (keybox) => {
    await deletion(keybox._id, this.db);
  };

  //deleteKeys = async () => await destroy(this.db);
  setPrivateKey = async (key) => await set(this.db, key);
  readPrivateKeys = async (notes = {}) =>
    //let notes = {};
    await read(this.db, notes);
}
const castFirestoreBox = async (
  deviceBox,
  deviceName,
  userDatas,
  devices,
  authorId,
  user,
  rsaPrivateKeys,
  vintage
) => {
  devices
    .where("authorId", "==", authorId)
    .get()
    .then(async (devs) => {
      if ((devs && devs.docs.length === 0) || !user.key) {
        rsaPrivateKeys
          .deleteKey(deviceBox)
          .then(
            async () =>
              await rsaPrivateKeys.setPrivateKey({
                _id: authorId,
                box: deviceBox.box,
                key: deviceBox.key,
                vintage
              })
          )
          .catch(standardCatch);
      } else {
        console.log("casting box");
        console.log(deviceBox);
        if (
          !user.pendingDeviceBoxes[vintage] ||
          !user.pendingDeviceBoxes[vintage].includes(deviceBox.box)
        ) {
          return await userDatas
            .update({
              ["pendingDeviceBoxes" +
              vintage]: firebase.firestore.FieldValue.arrayUnion(deviceBox.box)
            })
            .then(
              async () =>
                await devices
                  .add({
                    authorId,
                    box: deviceBox.box,
                    name: deviceName,
                    vintage
                  })
                  .then(() => "awaitingAuthMode")
                  .catch(standardCatch)
            )
            .catch(standardCatch);
        } else return console.log("box is already pending approval");
      }
    });
};

const getKeys = async (
  deviceBox,
  accountBox,
  user,
  rsaPrivateKeys,
  userDatas, //userdata doc
  devices,
  deviceName,
  authorId,
  vintage
) => {
  if (user["deviceBox" + deviceBox.box]) {
    await rsaPrivateKeys
      .setPrivateKey({
        _id: authorId,
        key: rsa.decrypt(
          user["deviceBox" + deviceBox.box],
          deviceBox.key,
          "SHA-256",
          {
            name: "RSA-PSS"
          }
        ),
        box: user.box,
        vintage
      })
      .then(
        async () =>
          await userDatas
            .update({
              ["pendingDeviceBoxes" +
              vintage]: firebase.firestore.FieldValue.arrayRemove(
                accountBox.box
              ),
              ["deviceBox" +
              deviceBox.box]: firebase.firestore.FieldValue.delete()
            })
            .then(
              async () =>
                await devices
                  .where("authorId", "==", authorId)
                  .where("box.n", "==", deviceBox.box.n)
                  .get()
                  .then((querySnapshot) => {
                    let foos = [];
                    let p = 0;
                    querySnapshot.docs.forEach((doc) => {
                      p++;
                      if (doc.exists) {
                        var foo = doc.data();
                        foo.id = doc.id;
                        foos.push(foo);
                      }
                    });
                    return (
                      querySnapshot.docs.length === p &&
                      devices
                        .doc(foos[foos.length].id)
                        .update({
                          authorized: true
                        })
                        .catch(standardCatch)
                    );
                  })
                  .catch(standardCatch)
            )
            .catch(standardCatch)
      );
  } /*else
    await castFirestoreBox(
      deviceBox,
      deviceName,
      userDatas,
      devices,
      authorId,
      user,
      rsaPrivateKeys,
      vintage
    );*/ //this shouldn't run unless interrupted
};
const getDevices = (user, userDatas, accountBox, vintage) =>
  user.pendingDeviceBoxes[vintage] &&
  user.pendingDeviceBoxes[vintage].length > 0 &&
  user.pendingDeviceBoxes[vintage].map(
    async (deviceBox) =>
      await userDatas
        .update({
          ["pendingDeviceBoxes" +
          vintage]: firebase.firestore.FieldValue.arrayRemove(accountBox.box),
          ["deviceBox" + deviceBox]: rsa.encrypt(
            accountBox.key,
            deviceBox,
            "SHA-256",
            {
              name: "RSA-PSS"
            }
          )
        })
        .then(() => {})
        .catch(standardCatch)
  );

const saveDevice = async (
  user,
  userProps,
  rsaPrivateKeys,
  deviceName,
  userDatas,
  devices,
  authorId,
  device,
  vintage
) =>
  await rsa
    .generateKey(2048)
    .then(async (accountBox) => {
      console.log("fashioned keys");
      console.log(accountBox);
      const keybox = {
        _id: device ? "device" : authorId,
        key: accountBox.privateKey,
        box: accountBox.publicKey,
        vintage
      };
      console.log("saving");
      console.log(keybox);
      //with device-box, get account-key
      if (!userProps.box) {
        console.log("totally new account-box");
        //& device-box (same for first device)
        user
          .update({ box: keybox.box }) //keys are only on device
          .then(() =>
            console.log(
              "Establishing an original keybox for your account... success!  " +
                "Now you can copy this to access on-device, end-to-end encrypted chats"
            )
          )
          .catch(standardCatch);
        await devices
          .add({
            authorId,
            box: keybox.box,
            name: deviceName
          })
          .then(() => "awaitingAuthMode")
          .catch(standardCatch);
      } else {
        console.log("adding as an additional device");
        await castFirestoreBox(
          keybox,
          specialFormatting(deviceName),
          userDatas,
          devices,
          authorId,
          user,
          rsaPrivateKeys,
          vintage
        );
      }
      return await rsaPrivateKeys.setPrivateKey(keybox);
      //randomString(4, "aA#")
    })
    .catch(standardCatch);

const fumbler = async (
  user,
  userDatas,
  devices,
  deviceName,
  authorId,
  vintage
) => {
  if (!(user && userDatas && devices && deviceName && authorId && vintage)) {
    console.log(`REACT-FUMBLER: requires ...[
    userDocRef,
    userDatasDocRef,
    devicesCollectionRef,
    deviceName[String],
    authorId[auth.uid],
    vintage[partition for content:default desc[0]]] but got:`);
    return console.log([
      user,
      userDatas,
      devices,
      deviceName,
      authorId,
      vintage
    ]);
  }
  return await user.get().then(async (bar) => {
    var userProps = bar.data();
    userProps.id = bar.id;
    userDatas.get().then((barr) => {
      var userDatasProps = barr.data();
      userDatasProps.id = barr.id;
      if (
        !userDatasProps.vintages ||
        !userDatasProps.vintages.includes(vintage)
      )
        userDatas
          .update({
            vintages: firebase.firestore.FieldValue.arrayUnion(vintage),
            defaultVintage: vintage
          })
          .catch(standardCatch);
    });
    const rsaPrivateKeys = new RSA();
    await rsaPrivateKeys
      .readPrivateKeys()
      .then(async (keysOutput) => {
        console.log(keysOutput);
        var keyBoxes = Object.values(keysOutput);
        if (keyBoxes) {
          keyBoxes = keyBoxes.map((x) => {
            if (!x.box || !x.key) {
              rsaPrivateKeys.deleteKey(x);
              return null;
            }
            return x;
          });
          console.log(keyBoxes);
          const accountBox = keyBoxes.find(
            (x) => x._id === authorId && vintage === x.vintage
          );
          devices
            .where("authorId", "==", authorId)
            .where("vintage", "==", vintage)
            .get()
            .then(async (devs) => {
              if (accountBox) {
                //user keyBox found (locally), and useable. Everytime, salt the
                //account-key stored on device for all pendingDeviceBoxes
                //syncPending
                console.log("found account box");
                console.log(accountBox);
                getDevices(userProps, userDatas, accountBox, vintage);
                //async await require stringify? if already then'd,
                //it is already object

                //hydrate keys
                const output = {
                  accountBox,
                  fumblingComplete: true,
                  devices: devs.docs
                    .map((doc) => {
                      if (doc.exists) {
                        var foo = doc.data();
                        foo.id = doc.id;
                        if (foo.name !== deviceName) {
                          foo.name = deviceName;
                          devices.doc(foo.id).update({ name: deviceName });
                        }
                        return foo;
                      } else return null;
                    })
                    .filter((x) => x)
                };
                return await new Promise((resolve) =>
                  resolve(JSON.stringify(output))
                );
              } else {
                const deviceBox = keyBoxes.find(
                  (x) => x._id === "device" && vintage === x.vintage
                );
                if (deviceBox) {
                  //no user keyBox found (locally), but device-box has been
                  //provisioned/forged (locally). Next,
                  console.log("found device box");
                  console.log(deviceBox);
                  getKeys(
                    deviceBox,
                    accountBox,
                    userProps,
                    rsaPrivateKeys,
                    userDatas,
                    devices,
                    deviceName,
                    authorId,
                    vintage
                  );
                  return null;
                } else if (userProps.box || devs.docs.length === 0) {
                  return saveDevice(
                    user,
                    userProps,
                    rsaPrivateKeys,
                    deviceName,
                    userDatas,
                    devices,
                    authorId,
                    devs.docs.length > 0,
                    vintage
                  );
                } else
                  devices
                    .where("authorId", "==", authorId)
                    .get()
                    .then((querySnapshot) => {
                      querySnapshot.docs.forEach((doc) => {
                        if (doc.exists) {
                          devices
                            .doc(doc.id)
                            .delete()
                            .then(() => {})
                            .catch(standardCatch);
                        }
                      });
                      keyBoxes.forEach((x) => rsaPrivateKeys.deleteKey(x));
                    });
              }
            });
        } /* else saveDevice(
          user,
          userProps,
          rsaPrivateKeys,
          deviceName,
          userDatas,
          devices,
          authorId
        );*/
      })
      .catch(standardCatch);
  });
};
const updateMyKeys = async (rsaPrivateKeys, room, user) => {
  await rsaPrivateKeys
    .readPrivateKeys()
    .then(async (keysOutput) => {
      const keyBoxes = Object.values(keysOutput);
      var keyBox = keyBoxes.find((x) => x._id === room.id);
      if (keyBox) {
        const saltedKeys = room["saltedKeys" + this.props.authorId];
        saltedKeys &&
          rsa
            .decrypt(saltedKeys, user.key, "SHA-256", {
              name: "RSA-PSS"
            })
            .then(async (privateRoomKey) => {
              if (keyBox.key !== privateRoomKey) {
                const keyBoxConfirmed = await rsaPrivateKeys.setPrivateKey({
                  _id: room.id,
                  key: keyBox.key,
                  box: room.box,
                  vintage: keyBox.vintage
                });
                keyBoxConfirmed &&
                  console.log("keyBox established locally for " + room.id);
              } else
                console.log(
                  "there is a keyBox already registered for " + room.id
                );
            });
      } else {
        //add saltedKey to pouchDB (local-storage)
      }
    })
    .catch((err) => console.log(err.message));
};
const roomKeys = async (room, recipientsProfiled, rooms, user) => {
  const rsaPrivateKeys = new RSA();
  //same: room, or recipients && entityType + entityId
  if (room.publicRoomKey) {
    updateMyKeys(rsaPrivateKeys, room, user);
  } else {
    //new: room, or new recipients (or threadId from entity)
    return await rsa.generateKey(2048).then(async (roomBox) => {
      if (
        await rsaPrivateKeys.setPrivateKey({
          _id: room.id,
          key: roomBox.key,
          box: roomBox.box,
          vintage: roomBox.vintage
        })
      ) {
        return Promise.all(
          recipientsProfiled.map(
            (user) =>
              new Promise((resolve, reject) => {
                const saltedKey = room["saltedKeys" + user.id];

                if (saltedKey) {
                  resolve(saltedKey); //String
                } else {
                  const saltedKey = rsa.encrypt(
                    roomBox.key,
                    user.box,
                    "SHA-256",
                    {
                      name: "RSA-PSS"
                    }
                  );
                  saltedKey && resolve(user.id + saltedKey);
                }
              })
          )
        ).then((saltedKeys) => {
          let p = 0;
          var rm = { ...room };
          saltedKeys.map((out, p) => {
            p++;
            const user = recipientsProfiled.find((x) => out.startsWith(x.id));
            return (rm["saltedKeys" + user.id] =
              user && out.substring(user.id.length, out.length));
          });
          delete rm.id;
          rm.box = roomBox.box;
          if (p === saltedKeys.length) rooms.doc(room.id).update(rm);
        });
      }
    });
  }
};

const deleteFumbledKeys = (keybox, devices) => {
  const rsaPrivateKeys = new RSA();

  rsaPrivateKeys
    .readPrivateKeys()
    .then(async (keysOutput) => {
      const keyBoxes = Object.values(keysOutput);
      var keyboxResult = keyBoxes.find((x) => x.box === keybox.box);
      if (keyboxResult)
        devices
          .doc(keybox.id)
          .delete()
          .then(() =>
            rsaPrivateKeys
              .deleteKey(keyboxResult)
              .then(() => {
                console.log("deleted plan from local " + keybox.id);
                //this.getNotes();
              })
              .catch(standardCatch)
          )
          .catch(standardCatch);
    })
    .catch(standardCatch);
};
export { fumbler, roomKeys, deleteFumbledKeys, RSA };
