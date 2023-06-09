import { IKeyword} from 'src/types/keyword'
import styled from 'styled-components'
import CMContainer from 'src/components/common/CMContainer'
import { useCallback, useEffect, useRef, useState } from 'react'
import CMNoticeLIne from '../common/CMNoticeLIne'
import KeywordRecent from './KeywordRecent'
import keywordApi from 'src/api/keyword'
import { useDebounce } from 'src/hooks/useDebounce'
import { isExpired } from 'src/utils/isExpired'
import KeywordInput from './KeywordInput'
import { handleSliceData} from 'src/utils/handleSliceData'

type Props ={
  isClick: boolean
  setIsClick: React.Dispatch<React.SetStateAction<boolean>>
}

const KeywordList = ({isClick,setIsClick}:Props) => {

  const {fetchKeyword} = keywordApi

  const autoRef = useRef<HTMLUListElement>(null);
  const [selectIndex,setSelectIndex] = useState<number>(-1);

  const [keyword,setKeyword] = useState("");
  const [keywordInfo,setkeywordInfo] = useState<Array<IKeyword>>();

  const debounceKeyword = useDebounce(keyword);

  const handleSearchKeywords = useCallback(async (keyword:string)=>{
    
    const rememberKeyword = localStorage.getItem(keyword);
    
    if(rememberKeyword){
      const parseData = JSON.parse(rememberKeyword);
      if (isExpired(parseData.expiry)) {
        handleNewData(keyword)
        return
      }
      setkeywordInfo(handleSliceData(parseData))
      return
    }

    handleNewData(keyword)
    
  },[setKeyword])  
  
  const handleNewData = async (keyword:string)=>{
    const data = await fetchKeyword(keyword);
    const sliceDatas = handleSliceData(data)
    setkeywordInfo(sliceDatas)
    handleSaveCashe(keyword,sliceDatas);
  }

  const handleSaveCashe = (keyword:string,data:Array<IKeyword>)=>{
    if(data.length>0){
      const now = new Date();
      const casheData = JSON.stringify([...data,{expiry:now.getTime()}]);
      localStorage.setItem(keyword,casheData);
    }
  }

  useEffect(()=>{
    handleSearchKeywords(debounceKeyword);
  },[debounceKeyword])


  return (
    <>
    <KeywordInput index={selectIndex} setIndex={setSelectIndex} keyword={keyword} setKeyword={setKeyword} isClick={isClick} setIsClick={setIsClick} refetch ={handleSearchKeywords}/>
      {
        (keyword && keywordInfo && isClick) &&
        <CMContainer>
        <>
          <S.KeywordLine>
            {keyword}
          </S.KeywordLine>
          <S.SearchWrap ref={autoRef}>
            {
              keywordInfo.length > 0 ? 
              <>
                <CMNoticeLIne>추천 검색어</CMNoticeLIne>
                {keywordInfo.map((keywordItem,idx) => (
                  <S.SearchItem focus = {selectIndex === idx}>{keywordItem.name}</S.SearchItem>
                ))}
              </>
              :
              <CMNoticeLIne>검색어가 없습니다.</CMNoticeLIne>
            }
          </S.SearchWrap>
        </>
        </CMContainer>
      }
      {
        (!keyword && isClick) && <KeywordRecent setIsClick={setIsClick} />
      }
    </>
  )
}

const S = {
  SearchWrap: styled.ul`
  `,
  SearchItem: styled.li<{focus:boolean}>`
    padding:10px 20px;
    font-weight:bold;
    cursor: pointer;
    &:hover{
      background-color: rgba(0,0,0,0.1);
    }
    background-color: ${({focus})=>focus ? "rgba(0,0,0,0.1)" : "#fff"};
  `,
  KeywordLine: styled.div`
    margin-top:10px;
    padding:10px 20px;
    cursor: pointer;
    &:hover{
      background-color: rgba(0,0,0,0.1);
    }
  `,
}

export default KeywordList