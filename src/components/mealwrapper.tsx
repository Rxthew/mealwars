import CategoryFilter from './mealfilter'
import {v4 as genKey} from 'uuid'
import {fetchOptions, MainMealCard, mainTransition, MealCard} from './mealcard'
import {useState, useEffect, useRef} from 'react'



const mealCategoriesLink:string = 'https://www.themealdb.com/api/json/v1/1/categories.php'

interface mealCategoriesJSON {
  categories : [{
      readonly strCategory : string
  }]
}

export interface typeFilterObject {
     [index: string] : 'yes' | 'no'
}

let currentAbort: AbortController | null = null



const generateCategories = async function():Promise<mealCategoriesJSON | undefined> {
  try{
    const abortControl = new AbortController()
    currentAbort = abortControl
    const abortSignal = abortControl.signal  
      const response = await fetch(mealCategoriesLink, {mode:'cors',signal: abortSignal})
      const mealCat = await response.json()
      return mealCat

  }
  catch(error){
    let e = error as Error
    if(e.message === 'The operation was aborted. '){
        return
    }
    else{
        console.log(error)
    }
    return
  }
}

const filterList = async function():Promise<string[] | void>{
  const categoriesObject = await generateCategories()
  let mealCategories:string[] = []
  if(categoriesObject){
      for(let category of categoriesObject['categories']){
          mealCategories = [...mealCategories, category.strCategory]
      }
      return mealCategories
  }
  
}


const MealWrapper = function(): JSX.Element{

    let [typeFilter,setTypeFilter] = useState<typeFilterObject>({})
    let latestFilter: {current: typeFilterObject | undefined}= useRef()
    let [mainName, setMainName] = useState<string | undefined>()
    let latestName = useRef(mainName)
    let [isMealFetched,setIsMealFetched] = useState<boolean>(true)
    let [warsContent, setWarsContent] = useState<boolean>(false) 

    const revealGame = function(){
        setWarsContent(true)
    }
    
    const newRandom = function(){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        setRandomCard( r =>
            <MealCard id={genKey()} filterObject={currentFilter} fetchers={r.props.fetchers}  main={r.props.main}/>
        )
    }

    const newMain = function(reserveData:JSX.Element,reservedName:string){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        setMainCard( m =>
            <MainMealCard id={genKey()} fetchers={m.props.fetchers}  cardData={reserveData} reservedName={reservedName} filterObject={currentFilter} main={m.props.main}/>
        )

    }

    const promoteToMain = function(reserveData:JSX.Element,reservedName:string){
        setMainName(reservedName)
        setTimeout(()=>{
            newRandom()
            newMain(reserveData,reservedName)
        },1000)
        
    }

    const refreshMain = function(reserveData:JSX.Element,reservedString:string){
        let currentFilter = latestFilter.current ? latestFilter.current : typeFilter
        if(reserveData){
            setMainCard( m => <MainMealCard id={genKey()} cardData={reserveData} fetchers={m.props.fetchers}  reservedName={reservedString} filterObject={currentFilter} main={Object.assign(m.props.main,{currentMainName: latestName.current})}/>
            )  

        }
        setTimeout(function(){
            newRandom()
        },1000)
        
    }

    const fetchers:fetchOptions = {
        fetchState :  isMealFetched,
        fetchSetter : setIsMealFetched
    }

    const templateMain = {
        currentMainName: () =>latestName.current,
        mainNameSetter: setMainName,

    }
    const refreshBox:mainTransition = Object.assign({},templateMain,{mainHandleFunction : refreshMain})
    const promoteBox:mainTransition = Object.assign({},templateMain,{mainHandleFunction : promoteToMain})
    
    let [mainCard, setMainCard] = useState<JSX.Element>(<MainMealCard fetchers={fetchers} id={genKey()} reservedName={mainName} cardData={<div id='new'></div>} filterObject={typeFilter} main={refreshBox}/>)
    let [randomCard, setRandomCard] = useState<JSX.Element>(<MealCard fetchers={fetchers}  id={genKey()} filterObject={typeFilter} main={promoteBox}/>)
    let [score, setScore] = useState<number>(0)
    

    useEffect(()=> {

        const populateFilter = async function(){
            const mealTypes = await filterList()
            if(mealTypes){
                let mealTypesObject:typeFilterObject = {}
                mealTypes.map(elem => mealTypesObject[`${elem}`] = 'yes')
                setTypeFilter(mealTypesObject)
                latestFilter.current = mealTypesObject
            }              
        }
        populateFilter()

        return () => {
                currentAbort?.abort()
        }
    },[])

    useEffect(() =>{
        latestName.current = mainName
    },[mainName])

    useEffect(()=>
    {   
        setScore(s => ++s)
    },[randomCard])

    useEffect(()=>{
        if(mainCard.props.cardData.props.id === 'new'){
            setScore(0)
        }
        else{
            setScore((s) => s === -1 ? 0 : 1)
        }
        
        return () => {
           if(mainCard.props.cardData.props.id === 'new'){
            setScore(-1)
           }
        }
           
        
    },[mainCard])

    useEffect(()=>{
       if(latestFilter.current === typeFilter ){
            return
       }
       latestFilter.current = typeFilter
       let filterValues = Object.values(typeFilter).filter(elem => elem !== 'no')
       if(filterValues.length > 0 && !isMealFetched){
            setIsMealFetched(true)
            setRandomCard( r =>
                <MealCard id={genKey()} fetchers={Object.assign(r.props.fetchers, {fetchState : true})} filterObject={typeFilter} main={r.props.main}/>
            )
            setMainCard(m => <MainMealCard id={genKey()} fetchers={Object.assign(m.props.fetchers,{fetchState : true})} cardData={<div id='new'></div>} reservedName={m.props.reservedName} filterObject={typeFilter} main={m.props.main}/>)

       }
       else {
            setRandomCard( r =>
                <MealCard id={genKey()} fetchers={r.props.fetchers} filterObject={typeFilter} main={r.props.main}/>
            )
            setMainCard(m => <MainMealCard id={genKey()} fetchers={m.props.fetchers} cardData={<div id='new'></div>} reservedName={m.props.reservedName} filterObject={typeFilter} main={m.props.main}/>)

        }
        

    },[typeFilter,isMealFetched])
   
    useEffect(()=>{ 
        if(!isMealFetched ){
            setMainCard(m => <MainMealCard id={genKey()} fetchers={Object.assign(m.props.fetchers,{fetchState : isMealFetched})} cardData={m.props.cardData} reservedName={m.props.reservedName} filterObject={m.props.filterObject} main={m.props.main}/>)
            setRandomCard(r => <MealCard id={genKey()} fetchers={Object.assign(r.props.fetchers,{fetchState : isMealFetched})} filterObject={r.props.filterObject} main={r.props.main}/>)
        }   

    },[isMealFetched])
                

    if(score > 4){ 
        return(
            <main>
                <h2>Looks like you have a winner!</h2>
                {mainCard.props.cardData}
            </main>
        )
    }
    return (
        <main>
            {warsContent ? 
            <section>
                <div>
                    <h3>Which meal do you prefer?</h3>
                    <h4>First meal to win five rounds wins!</h4>
                </div>
                <div className='score'>
                    <p className='score'>
                    {score}
                    </p>
                </div>
                <div>
                    <h4>Leader:</h4>
                    {mainCard}
                </div>
                <div>
                <h4>Challenger:</h4>
                {randomCard}
                </div>        
            </section> : false}
            <section>
                <div>
                    <h3>Food Categories:</h3>
                    <h4>Tap on the categories to filter the types of meals you want.</h4>
                </div>    
                <CategoryFilter filterObject={typeFilter} setFilterObject={setTypeFilter}/>
                {warsContent ? false : <button onClick={revealGame}>Proceed</button>}
            </section>      
        </main>
    )

}

export default MealWrapper