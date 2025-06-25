import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  db,
  CUSTOMERS_COLLECTION,
  CHECK_INS_COLLECTION,
  SETTINGS_COLLECTION,
} from '../firebase';
import moment from 'moment-timezone';

// 获取温哥华时区的今天日期字符串 (YYYY-MM-DD)
const getTodayVancouver = () => {
  return moment().tz('America/Vancouver').format('YYYY-MM-DD');
};

// Customers
export const addCustomer = async (name) => {
  const docRef = await addDoc(collection(db, CUSTOMERS_COLLECTION), {
    name,
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, name };
};

export const subscribeToCustomers = (callback) => {
  const q = query(collection(db, CUSTOMERS_COLLECTION));
  return onSnapshot(q, (snapshot) => {
    const customers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(customers);
  });
};

// Check-ins
export const addCheckIn = async (customerId) => {
  try {
    const today = getTodayVancouver();
    console.log(
      'Adding check-in for customer:',
      customerId,
      'on date (Vancouver):',
      today
    );

    const dailyRecordRef = doc(db, 'dailyRecords', today);
    console.log('Document reference created:', dailyRecordRef.path);

    // 获取或创建当天的记录
    const dailyRecord = await getDoc(dailyRecordRef);
    console.log('Daily record exists:', dailyRecord.exists());

    let existingCheckIns = [];
    if (dailyRecord.exists()) {
      const data = dailyRecord.data();
      existingCheckIns = data.activeCheckIns || [];
      console.log('Existing check-ins:', existingCheckIns);
    } else {
      console.log('Creating new daily record');
      await setDoc(dailyRecordRef, {
        date: today,
        createdAt: new Date().toISOString(),
        activeCheckIns: [],
      });
    }

    // 添加新的签到记录
    const newCheckIn = {
      customerId,
      checkInTime: new Date().toISOString(),
    };
    console.log('New check-in record:', newCheckIn);

    // 更新当天的活跃签到列表
    const updatedCheckIns = [...existingCheckIns, newCheckIn];
    console.log('Updating with check-ins:', updatedCheckIns);

    await setDoc(
      dailyRecordRef,
      {
        date: today,
        createdAt: dailyRecord.exists()
          ? dailyRecord.data().createdAt
          : new Date().toISOString(),
        activeCheckIns: updatedCheckIns,
      },
      { merge: true }
    );

    console.log('Update successful');

    return { id: today, customerId };
  } catch (error) {
    console.error('Error in addCheckIn:', error);
    throw error;
  }
};

export const updateCheckOut = async (date, customerId) => {
  try {
    console.log(
      'Updating check-out for customer:',
      customerId,
      'on date (Vancouver):',
      date
    );

    const dailyRecordRef = doc(db, 'dailyRecords', date);
    console.log('Document reference:', dailyRecordRef.path);

    const dailyRecord = await getDoc(dailyRecordRef);
    console.log('Daily record exists:', dailyRecord.exists());

    if (dailyRecord.exists()) {
      const data = dailyRecord.data();
      console.log('Current document data:', data);

      const activeCheckIns = data.activeCheckIns || [];
      console.log('Current active check-ins:', activeCheckIns);

      // 只保留未签出的记录
      const updatedCheckIns = activeCheckIns.filter(
        (checkIn) => checkIn.customerId !== customerId
      );

      console.log('Updated check-ins:', updatedCheckIns);

      await setDoc(
        dailyRecordRef,
        {
          ...data,
          activeCheckIns: updatedCheckIns,
        },
        { merge: true }
      );

      console.log('Check-out update successful');
    } else {
      console.error('Daily record not found for date:', date);
      throw new Error('Daily record not found');
    }
  } catch (error) {
    console.error('Error in updateCheckOut:', error);
    throw error;
  }
};

export const subscribeToActiveCheckIns = (callback) => {
  const today = getTodayVancouver();
  console.log('Subscribing to active check-ins for date (Vancouver):', today);

  const dailyRecordRef = doc(db, 'dailyRecords', today);
  console.log('Document reference:', dailyRecordRef.path);

  return onSnapshot(
    dailyRecordRef,
    (doc) => {
      try {
        console.log(
          'Snapshot received:',
          doc.exists() ? 'Document exists' : 'Document does not exist'
        );

        if (doc.exists()) {
          const data = doc.data();
          console.log('Document data:', data);

          if (data && Array.isArray(data.activeCheckIns)) {
            const activeCheckIns = data.activeCheckIns.map((checkIn) => ({
              ...checkIn,
              date: today,
            }));
            console.log('Active check-ins:', activeCheckIns);
            callback(activeCheckIns);
          } else {
            console.log('No active check-ins array found in document');
            callback([]);
          }
        } else {
          console.log('Document does not exist, returning empty array');
          callback([]);
        }
      } catch (error) {
        console.error('Error processing active check-ins:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('Error in onSnapshot:', error);
    }
  );
};

// Settings
export const updateSettings = async (data) => {
  const settingsRef = doc(db, SETTINGS_COLLECTION, 'default');
  await setDoc(settingsRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const subscribeToSettings = (callback) => {
  const settingsRef = doc(db, SETTINGS_COLLECTION, 'default');
  return onSnapshot(settingsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

export const updateCheckInTime = async (date, customerId, newCheckInTime) => {
  try {
    console.log(
      'Updating check-in time for customer:',
      customerId,
      'on date (Vancouver):',
      date,
      'new time:',
      newCheckInTime
    );

    const dailyRecordRef = doc(db, 'dailyRecords', date);
    console.log('Document reference:', dailyRecordRef.path);

    const dailyRecord = await getDoc(dailyRecordRef);
    console.log('Daily record exists:', dailyRecord.exists());

    if (dailyRecord.exists()) {
      const data = dailyRecord.data();
      console.log('Current document data:', data);

      const activeCheckIns = data.activeCheckIns || [];
      console.log('Current active check-ins:', activeCheckIns);

      // 找到并更新指定客户的check-in时间
      const updatedCheckIns = activeCheckIns.map((checkIn) => {
        if (checkIn.customerId === customerId) {
          return {
            ...checkIn,
            checkInTime: newCheckInTime,
          };
        }
        return checkIn;
      });

      console.log('Updated check-ins:', updatedCheckIns);

      await setDoc(
        dailyRecordRef,
        {
          ...data,
          activeCheckIns: updatedCheckIns,
        },
        { merge: true }
      );

      console.log('Check-in time update successful');
    } else {
      console.error('Daily record not found for date:', date);
      throw new Error('Daily record not found');
    }
  } catch (error) {
    console.error('Error in updateCheckInTime:', error);
    throw error;
  }
};
