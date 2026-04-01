import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
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
  const svgRef = useRef();
  const svgSelectionRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFeedback, setSearchFeedback] = useState("");
  const width = window.innerWidth;
  const padding = 80;
  const dist = (width / 2 - padding) / 12;
  const height = window.innerHeight;

  const showTooltipForStar = (star, index) => {
    const x = width / 2 + star.distance * dist * Math.cos((index / stars.length) * 2 * Math.PI);
    const y = height / 2 + star.distance * dist * Math.sin((index / stars.length) * 2 * Math.PI) * 0.5;

    d3.select("#tooltip")
      .style("opacity", 1)
      .style("left", `${x + 20}px`)
      .style("top", `${y + 20}px`)
      .html(`<strong>${star.name}</strong><br/>${star.distance} ly<br/>${star.star_type}`);
  };

  const createStars = (svg) => {
    const starGroups = svg.selectAll("g.star")
      .data(stars)
      .join("g")
      .attr("class", "star")
      .attr("transform", (d, i) => {
        const x = width / 2 + d.distance * dist * Math.cos((i / stars.length) * 2 * Math.PI);
        const y = height / 2 + d.distance * dist * Math.sin((i / stars.length) * 2 * Math.PI) * 0.5;
        return `translate(${x}, ${y})`;
      });

    starGroups.append("circle")
      .attr("class", "halo-outer")
      .attr("r", d => d.size * 6)
      .attr("fill", d => d.color)
      .attr("opacity", 0.06);

    starGroups.append("circle")
      .attr("class", "halo-inner")
      .attr("r", d => d.size * 3)
      .attr("fill", d => d.color)
      .attr("opacity", 0.15);

    starGroups.append("circle")
      .attr("class", "core")
      .attr("r", d => d.size)
      .attr("fill", d => d.color)
      .attr("opacity", 1);

    starGroups
      .on("mouseover", function (event, d) {
        const group = d3.select(this);

        group.transition().duration(200);

        group.select("circle.halo-outer").attr("r", d.size * 10).attr("opacity", 0.1);
        group.select("circle.halo-inner").attr("r", d.size * 5).attr("opacity", 0.2);
        group.select("circle.core").attr("r", d.size * 2).attr("opacity", 1);

        d3.select("#tooltip")
          .style("opacity", 1)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY}px`)
          .html(`<strong>${d.name}</strong><br/>${d.distance} ly<br/>${d.star_type}`);
      })
      .on("mouseout", function (event, d) {
        const group = d3.select(this);

        group.transition().duration(300);

        group.select("circle.halo-outer").attr("r", d.size * 6).attr("opacity", 0.06);
        group.select("circle.halo-inner").attr("r", d.size * 3).attr("opacity", 0.15);
        group.select("circle.core").attr("r", d.size).attr("opacity", 1);

        d3.select("#tooltip").style("opacity", 0);
      });
  };


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
        .text(`${startvalue * i} ly`);
    }
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svgSelectionRef.current = svg;
    svg.selectAll("*").remove();
    speckledStarsBackground(svg);
    createText(svg);
    createStars(svg);
  }, []);

  const search = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchFeedback("");
      return;
    }

    const svg = svgSelectionRef.current;
    if (!svg) return;

    const matchIndex = stars.findIndex((star) => star.name.toLowerCase().includes(term));

    svg.selectAll("g.star").each(function (d) {
      const group = d3.select(this);
      group.select("circle.halo-outer").attr("r", d.size * 6).attr("opacity", 0.06);
      group.select("circle.halo-inner").attr("r", d.size * 3).attr("opacity", 0.15);
      group.select("circle.core").attr("r", d.size).attr("opacity", 1);
    });

    if (matchIndex >= 0) {
      const match = stars[matchIndex];
      const matchedGroup = svg.selectAll("g.star").filter((d) => d.name === match.name);

      matchedGroup.select("circle.halo-outer").transition().duration(250).attr("r", match.size * 12).attr("opacity", 0.12);
      matchedGroup.select("circle.halo-inner").transition().duration(250).attr("r", match.size * 7).attr("opacity", 0.3);
      matchedGroup.select("circle.core").transition().duration(250).attr("r", match.size * 2.2).attr("opacity", 1);

      showTooltipForStar(match, matchIndex);
      setSearchFeedback("");
    } else {
      d3.select("#tooltip").style("opacity", 0);
      setSearchFeedback("Star not found. Try a different name.");
    }
  };

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

      <label
        htmlFor="search-bar"
        style={{
          position: "absolute",
          top: "1.5%",
          left: "2%",
          color: "#cfd8ea",
          fontSize: "13px",
        }}
      >
        Search stars:
      </label>

      <input
        id="search-bar"
        style={{
          position: "absolute",
          top: "4%",
          left: "2%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "75px",
          padding: "8px 16px",
          color: "white",
          outline: "none",
          fontSize: "14px",
        }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            search();
          }
        }}
        placeholder="Search stars..."
      />

      <button
        type="button"
        onClick={search}
        style={{
          position: "absolute",
          top: "4%",
          left: "15%",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "75px",
          padding: "8px 16px",
          color: "white",
          outline: "none",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        Search
      </button>

      {searchFeedback && (
        <div
          style={{
            position: "absolute",
            top: "9%",
            left: "2%",
            color: "#ff9b9b",
            fontSize: "13px",
          }}
        >
          {searchFeedback}
        </div>
      )}
    </div>
  );
}

export default StarMap