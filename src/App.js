import React, { Component } from 'react';
import * as cheerio from 'cheerio';
import FlipMove from "react-flip-move";
import raw from './ICPC2021.txt';
class App extends Component {

    constructor(props) {
        super(props);
    }

    state = {
        contestName:"",
        teams:[],
        problems:[],
        timeStamps:[],
        time:0,
        totalTime:0,
        problemCount:0
    }

    processData = async (text)=>{
        const $ = cheerio.load(text);
        //   const baalsaal =$('.table > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(2) > a:nth-child(1)');
        const baalsaalAll =$('.table > tbody:nth-child(2) > tr');
        const problemCount = $('html body div#wrap div#content.container div.row div.col-md-12 div.panel.panel-default.panel-problems div.table-responsive table.table.table-standings thead tr th.text-center').length;
        const contestName = $('.col-md-8 > h2:nth-child(1)').text();
        this.setState({contestName});
        //   console.log(baalsaal.text());
        let teams = [];
        let totalTime = 300;
        let lastRank = [];
        let lastImprovement = [];
        let stablility = [];
        lastRank.push(0);
        stablility.push(5);
        let problemsAll = [];

        for(let i=1;i<=baalsaalAll.length;i++){
            let team = {};
            let problems= [];
            let totalSolved = 0;
            let teamNameAndUni = $(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > td:nth-child(2) > a:nth-child(1)`).text();
            const teamSplit = teamNameAndUni.split("[");
            let penalty = 0;

            const teamname = teamSplit[0].trim();
            let uniName = teamSplit[1];
            uniName = uniName.substring(0, uniName.length - 1).trim();
            // console.log(teamname,"|",uniName,"|");
            team.teamName = teamname;
            team.uniName = uniName;

            for(let p=0;p<problemCount;p++){
                let attempt = $(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > td:nth-child(${p+5}) > a:nth-child(1) > div:nth-child(2)`).text();
                if( attempt === "" )
                    problems.push({attempted:false,solved:false,attempt:0,time:0});
                else{
                    let attemptSplit = attempt.split("(");
                    if( attemptSplit.length === 1 ){
                        problems.push({attempted:true,solved:false,attempt:parseInt(attemptSplit[0].trim()),time:0});
                    }else{
                        problems.push({attempted:true,solved:true,attempt:parseInt(attemptSplit[0].trim()),time:parseInt(attemptSplit[1].substring(0, attemptSplit[1].length - 1).trim())});
                        penalty+=problems[p].time+(problems[p].attempt-1)*20;
                        totalSolved++;
                        totalTime = Math.max(problems[p].time,totalTime);
                    }
                }
                if( i===1 ){
                    problemsAll.push(String.fromCharCode(65+p));
                }
            }
            team.problems = problems;
            team.rank = i;
            team.position = i;
            team.penalty = penalty;
            team.totalSolved = totalSolved;
            team.improvement = 1;
            teams.push(team);
            lastRank.push(1);
            lastImprovement.push(0);
            stablility.push(10);
            /* let attempt1 = $(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > td:nth-child(${p}) > a:nth-child(1) > div:nth-child(2)`).text();
             let attempt2 = $(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > td:nth-child(6) > a:nth-child(1) > div:nth-child(2)`).text();
             let attempt3 = $(`.table > tbody:nth-child(2) > tr:nth-child(${i}) > td:nth-child(7) > a:nth-child(1) > div:nth-child(2)`).text();

             console.log(attempt1);
             console.log(attempt2);
             console.log(attempt3);*/

        }

        this.setState({teams});
        let timeStamps = [];
        for(let time=0;time<=totalTime;time++){
            let teamsTemp = [];
            for(let i=0;i<teams.length;i++)
                teamsTemp.push(JSON.parse(JSON.stringify(teams[i])));
            for(let t=0;t<teamsTemp.length;t++){
                teamsTemp[t].penalty = teams[t].penalty;
                for(let p=0;p<teamsTemp[t].problems.length;p++){
                    if( teamsTemp[t].problems[p].time <= time ){
                        // if( teamsTemp[t].problems[p].solved === true )
                        // console.log(time,"ekta gese");
                        ;

                    } else if( teamsTemp[t].problems[p].solved === true ){
                        teamsTemp[t].totalSolved--;
                        teamsTemp[t].penalty-= teamsTemp[t].problems[p].time+(teamsTemp[t].problems[p].attempt-1)*20;
                        teamsTemp[t].problems[p].solved = false;
                        teamsTemp[t].problems[p].attempted = false;
                    }
                    // if( teamsTemp[t].problems[p].time <= time )
                    //  console.log(teamsTemp[t].problems[p].time," ",time," true");
                    // else
                    //  console.log(teamsTemp[t].problems[p].time," ",time," false");
                }

            }
            //   console.log("==============",time);
            //    console.log(lastRank[8]);
            for(let m=0;m<teamsTemp.length;m++){

                for(let n=m+1;n<teamsTemp.length;n++){
                    if( teamsTemp[m].totalSolved<teamsTemp[n].totalSolved ){
                        let temp = teamsTemp[m];
                        teamsTemp[m] = teamsTemp[n];
                        teamsTemp[n] = temp;
                    }else if( teamsTemp[m].totalSolved === teamsTemp[n].totalSolved && teamsTemp[m].penalty > teamsTemp[n].penalty ){
                        let temp = teamsTemp[m];
                        teamsTemp[m] = teamsTemp[n];
                        teamsTemp[n] = temp;
                    }
                }
                teamsTemp[m].position = m+1;

                if( lastRank[ teamsTemp[m].rank ] === m+1 ) {
                    if( stablility[teamsTemp[m].rank] === 0)
                        teamsTemp[m].improvement = 0;
                    else{
                        stablility[teamsTemp[m].rank]--;
                        teamsTemp[m].improvement = lastImprovement[ teamsTemp[m].rank ];
                    }
                }else if( lastRank[ teamsTemp[m].rank ] < m+1 ) {
                    teamsTemp[m].improvement = 2;
                    stablility[teamsTemp[m].rank] = 5;
                } else {
                    teamsTemp[m].improvement = 1;
                    stablility[teamsTemp[m].rank] = 5;
                }
                lastRank[ teamsTemp[m].rank ] = m+1;
                lastImprovement[ teamsTemp[m].rank ] = teamsTemp[m].improvement;


            }

            timeStamps.push(teamsTemp);
        }
        // console.log(timeStamps);
        // console.log(teams);
        this.setState({timeStamps});
        this.setState({totalTime});
        this.setState({time:totalTime});
        this.setState({problems:problemsAll});
    }
    readDefault = () => {
        fetch(raw)
            .then(r => r.text())
            .then(text => {
                // console.log('text decoded:', text);
                this.processData(text);
            });
    }
    showFile = async (e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => {
            const text = (e.target.result)
           // console.log(text)
            this.processData(text);
        };
        reader.readAsText(e.target.files[0])
    }

    handleStart = ()=> {
        this.visualizeRank();
    }

    visualizeRank = async()=>{
        for(let time=0;time<=this.state.totalTime;time++){
        // for(let time=0;time<=this.state.totalTime;time++){
           // console.log(time," ",this.state.timeStamps[time][8].teamName,this.state.timeStamps[time][8].position,this.state.timeStamps[time][9].improvement);
            this.setState({teams:this.state.timeStamps[time]});
            this.setState({time});
           await sleep(1000);
          // console.log(time);
          // console.log(this.state.timeStamps[time]);
        }
    }

    render = () => {

        return (<div className="container" style={{verticalAlign:'middle',fontFamily:"\"Roboto\", \"Helvetica Neue\", Helvetica, Arial, sans-serif"}}>
                <div className="text-center">
                    <input className="btn btn-primary m-2" type="file" onChange={(e) => this.showFile(e)} />
                    <button className="btn btn-primary m-2" onClick={this.readDefault}>Load ICPC 2021</button><br/>
                    <button className="btn btn-primary" onClick={this.handleStart}>Start</button>
                </div>
                <h2 className="text-center">{this.state.contestName}</h2>
                <div className="text-center fs-2">Passed:{this.state.time}</div>
                <div className="text-center fs-2">Remaining:{this.state.totalTime-this.state.time}</div>
                <h4 className="row border rounded  align-baseline "
                     style={{backgroundColor:"#f8f5f0",padding:"15px",color:"#98978b",fontSize:"11px"}}>STANDINGS</h4>
                <div className="row p-1 border align-baseline bg-light"
                     style={{minHeight:"48.5px"}}>
                    <div className="col" style={{color:"#658733",fontSize:"14px",maxWidth:"40px"}}>⏹</div>
                    <div className="d-flex flex-wrap col" style={{color:"#658733",fontSize:"14px",maxWidth:"50px"}}>#</div>
                    <div className="d-flex flex-wrap col-4 text-dark" style={{fontSize:"14px"}}>Name</div>
                    {/*<div className="d-flex flex-wrap col-2 text-dark" style={{fontSize:"14px"}}>University</div>*/}
                    <div className="d-flex flex-wrap col"></div>
                    { this.state.problems.length!==0 && this.state.problems.map(problem=>{
                        return <div className="text-center d-flex flex-wrap col" style={{color:"#658733",fontWeight:"700"}}>{problem}</div>
                    }) }
                    </div>
                <FlipMove duration={1000} >
                    {
                        this.state.teams.map(team=> {
                            return <div
                                className="row p-1 border align-baseline bg-light"
                                style={{minHeight:"48.5px"}}
                                key={team.rank}>
                                <div className="col" style={{maxWidth:"40px"}}>
                                    { team.improvement === 2 && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#f47c3c" class="bi bi-caret-down-fill" viewBox="0 0 16 16">
                                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                                    </svg> }
                                    { team.improvement === 1 && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#658733" class="bi bi-caret-up-fill" viewBox="0 0 16 16">
                                        <path d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"/>
                                    </svg> }
                                    { team.improvement === 0 && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#29abe0" class="bi bi-dash-square-fill" viewBox="0 0 16 16">
                                        <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm2.5 7.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1z"/>
                                    </svg> }
                                </div>
                                <div className="d-flex flex-wrap col" style={{color:"#658733",fontSize:"14px",maxWidth:"50px"}}>{team.position}</div>
                                <div className=" col-4" >
                                    <div className="" style={{color:"#658733",fontSize:"14px",fontWeight:"700"}}>{team.teamName}</div>
                                    <div className=" " style={{color:"#658733",fontSize:"14px"}}>{team.uniName}</div>
                                </div>
                                {/*<div className="d-flex flex-wrap col-2 " style={{color:"#658733",fontSize:"14px"}}>{team.uniName}</div>*/}
                                <div className="col  m-1 p-0  text-center text-white " style={{fontWeight:700,fontSize:"10.5px"}} >
                                    <div className="" style={{backgroundColor:"#29abe0",borderTopLeftRadius:"2.625px",borderTopRightRadius:"2.625px"}}>{team.totalSolved}</div>
                                    <div className="bg-dark" style={{borderBottomLeftRadius:"2.625px",borderBottomRightRadius:"2.625px"}}>{team.penalty}</div>
                                </div>
                                {
                                    team.problems.map(problem=>{
                                        return <div className="col m-1 p-0 text-center text-white " style={{fontWeight:700,fontSize:"10.5px"}}  key={problem.id}>
                                            { problem.solved && <div className="" style={{backgroundColor:"#93c54b",borderTopLeftRadius:"2.625px",borderTopRightRadius:"2.625px"}}>{problem.attempt}</div> }
                                            { !problem.solved && problem.attempted && <div className="" style={{backgroundColor:"#f47c3c",borderTopLeftRadius:"2.625px",borderTopRightRadius:"2.625px"}}>{problem.attempt}</div> }
                                            { problem.attempted && <div className="bg-dark" style={{borderBottomLeftRadius:"2.625px",borderBottomRightRadius:"2.625px"}}>{problem.time}</div> }

                                        </div>
                                    })
                                }
                            </div>

                        })
                    }
                </FlipMove>

            </div>
        )
    }
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default App;