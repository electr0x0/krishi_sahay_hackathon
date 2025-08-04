import { ImpactStat } from '@/types';

export async function getImpactStats(): Promise<ImpactStat[]> {
  // Mock data - can be replaced with API call
  return [
    {
      id: '1',
      title: 'ফসলের ক্ষতি কমান',
      value: '৩৫%',
      description: 'AI এর মাধ্যমে আগাম সতর্কতায় ফসলের ক্ষতি কমান',
      icon: '🌾'
    },
    {
      id: '2',
      title: 'লাভ বৃদ্ধি',
      value: '৫০%',
      description: 'সরাসরি ক্রেতার সাথে যোগাযোগে মধ্যস্বত্বভোগী বাদ দিয়ে লাভ বাড়ান',
      icon: '📈'
    },
    {
      id: '3',
      title: 'পানি সাশ্রয়',
      value: '৪০%',
      description: 'স্মার্ট সেচ ব্যবস্থায় পানির অপচয় রোধ করুন',
      icon: '💧'
    },
    {
      id: '4',
      title: 'কৃষক সহায়তা',
      value: '১০,০০০+',
      description: 'দেশব্যাপী কৃষকদের ডিজিটাল সেবা প্রদান',
      icon: '👨‍🌾'
    }
  ];
}

export async function getFeatures() {
  return [
    {
      id: '1',
      title: 'AI পরামর্শ',
      description: 'বাংলা ভাষায় দৈনিক কৃষি পরামর্শ পান',
      icon: '🤖'
    },
    {
      id: '2',
      title: 'স্মার্ট সেচ',
      description: 'স্বয়ংক্রিয় সেচ ব্যবস্থায় ৫০% পানি সাশ্রয়',
      icon: '🚿'
    },
    {
      id: '3',
      title: 'রোগ নির্ণয়',
      description: 'ড্রোন ও ছবি বিশ্লেষণে পোকার আক্রমণ প্রাথমিক সনাক্তকরণ',
      icon: '🔍'
    },
    {
      id: '4',
      title: 'সঠিক বাজার',
      description: 'মধ্যস্বত্বভোগী ছাড়া সরাসরি ক্রেতার সাথে যোগাযোগ',
      icon: '🏪'
    }
  ];
}

export async function getWorkSteps() {
  return [
    {
      id: '1',
      step: 1,
      title: 'খামার নিবন্ধন',
      description: 'আপনার খামারের তথ্য দিয়ে নিবন্ধন করুন',
      icon: '📝'
    },
    {
      id: '2',
      step: 2,
      title: 'AI সতর্কতা',
      description: 'আবহাওয়া ও ফসলের সতর্কতা বার্তা পান',
      icon: '🚨'
    },
    {
      id: '3',
      step: 3,
      title: 'লাভজনক বিক্রয়',
      description: 'উচিত দামে ফসল বিক্রয় করুন',
      icon: '💰'
    }
  ];
}
