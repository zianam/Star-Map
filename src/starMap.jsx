import * as d3 from "d3";
import { useEffect, useRef } from "react";
import stars from "./starInfo.json";

function speckledStarsBackground(svg) {
  for (let i = 0; i < 150; i++) {
    const cx = Math.random() * window.innerWidth;
    const cy = Math.random() * window.innerHeight;
    const r = Math.random() * 1 + 0.2;
    svg.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r)
      .attr("fill", "white")
      .attr("opacity", Math.random() * 0.5 + 0.1);
  }
}

function StarMap() {
  const svgRef = useRef()
  const width = window.innerWidth;
  const padding = 80
  const dist = (width / 2 - padding) / 12
  const height = window.innerHeight;


  // const createTicks = (svg) => {
  //    for (let i = 0; i < 5; i++) {
  //     svg.append("line")
  //       .attr("x1", width / 2 + i * dist)
  //       .attr("y1", height / 2 - 10)
  //       .attr("x2", width / 2 + i * dist)
  //       .attr("y2", height / 2 + 10)
  //       .attr("stroke", "#5431bc")
  //       .attr("stroke-width", 3)
  //   }
  // }

   const createStars = (svg) => {
    const starGroups = svg.selectAll("g.star")
      .data(stars)
      .join("g")
      .attr("class", "star")
      .attr("transform", (d, i) => {
        const x = width / 2 + d.distance * dist * Math.cos((i / stars.length) * 2 * Math.PI)
        const y = height / 2 + d.distance * dist * Math.sin((i / stars.length) * 2 * Math.PI) * 0.5
        return `translate(${x}, ${y})`
      })

    starGroups.append("circle")
      .attr("class", "halo-outer")
      .attr("r", d => d.size * 6)
      .attr("fill", d => d.color)
      .attr("opacity", 0.06)

    starGroups.append("circle")
      .attr("class", "halo-inner")
      .attr("r", d => d.size * 3)
      .attr("fill", d => d.color)
      .attr("opacity", 0.15)

    starGroups.append("circle")
      .attr("class", "core")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("opacity", 1)

    starGroups
      .on("mouseover", function (event, d) {
        const tooltip = d3.select("#tooltip")
        const group = d3.select(this)

        group.select("circle.halo-outer").attr("r", d.size * 10).attr("opacity", 0.1)
        group.select("circle.halo-inner").attr("r", d.size * 5).attr("opacity", 0.2)
        group.select("circle.core").attr("r", d.size * 2).attr("opacity", 1)

        tooltip
          .style("opacity", 1)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px")
          .html(`<strong>${d.name}</strong><br/>${d.distance} ly<br/>${d.star_type}`)
      })
      .on("mouseout", function (event, d) {
        const group = d3.select(this)

        group.select("circle.halo-outer").attr("r", d.size * 6).attr("opacity", 0.06)
        group.select("circle.halo-inner").attr("r", d.size * 3).attr("opacity", 0.15)
        group.select("circle.core").attr("r", d.size).attr("opacity", 1)

        d3.select("#tooltip").style("opacity", 0)
      })
  }


  const createText = (svg) => {
    const startvalue = 3;
    for (let i = 1; i < 5; i++) {
      svg.append("text")
        .attr("x", width / 2 + (startvalue * i) * dist)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#4b638b")
        .attr("font-size", "17px")
        .attr("font-family", "Arial, sans-serif")
        .text(`${startvalue * i} ly`)
    }
  }

  useEffect(() => {
    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    speckledStarsBackground(svg)
    createText(svg)
    createStars(svg)
  }, [])

  return (
  <div style={{ position: "relative" }}>
    <svg ref={svgRef} width="100%" height="100vh" style={{ background: "#07080f" }} />
    <div id="tooltip" style={{
      position: "absolute",
      opacity: 0,
      background: "rgba(0,0,0,0.8)",
      color: "white",
      padding: "8px 12px",
      borderRadius: "8px",
      pointerEvents: "none",
    }} />
  </div>
)
}


export default StarMap