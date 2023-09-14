interface ICTAProps {
  text: string;
  link: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface IPlayerProps {
  id: number;
  content: {
    width: number;
    height: number;
    source: string;
    timeout?: number;
    type: 'image' | 'video/mp4';
  };
  enhancements?: {
    audio?: {
      src: string;
    };
  };
  layout?: {
    design: number;
    likeButton: boolean;
    isLiked: boolean;
    author: string;
    title: string;
    description: string;
    cta?: ICTAProps;
  };
}

export interface IStory {
  id: string;
  container: IContainerProps;
  player: IPlayerProps[];
}

interface IContainerProps {
  isViewed: boolean;
  border: {
    color: string;
    width: number;
  };
  background: {
    src: string;
  };
  author: {
    src: string;
  };
}

export interface TrackingObject {
  event: string;
  payload: {
    domain: string;
    time: number;
    count?: number;
    slide?: IPlayerProps;
    story?: IStory;
    device: string;
  };
}

export interface FirebasePayload {
  name: string;
  time: number;
  count?: number;
  slide?: IPlayerProps;
  story?: IStory;
  device: string;
}
