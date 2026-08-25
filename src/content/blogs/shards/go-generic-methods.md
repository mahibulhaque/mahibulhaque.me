---
title: Arrival of Generic Methods in Go v1.27
date: 2026-08-21T00:00:00.000Z
description: >-
  A method declaration may now declare its own type parameters, independent of
  the receiver’s. Before Go 1.27, only top-level functions could be generic, so
  a generic operation on a type had to live as a package-level function instead
  of a method.
tags:
  - go
  - news
aliases: []
discussions: []
mermaid: false
type_label: ''
ogImage: site-cover.png
atUri: 'at://did:plc:miwiepbo3e3sh5fknyt7jxqm/site.standard.document/3mtlmjc7tw623'
---

## Overview

When generics landed in Go (golang) 1.18, they came with a rule that has annoyed people ever since: functions could declare type parameters, but methods could not. Go 1.27 removes that rule. A method can now declare its own type parameters, which makes patterns like chainable transformations possible for the first time.

## Problem

Say we have a generic Slice[T] and we want a Map operation that transforms every element into a new type U. The receiver already binds T, but U is new. Before Go 1.27, a method had no way to introduce it, so Map was forced to live at the package level:

```go
type Slice[T any] struct {
	items []T
}

func (s *Slice[T]) Push(v T) {
	s.items = append(s.items, v)
}

// Map can't be a method before Go 1.27, because U is a new type
// parameter. It has to live at the package level.
func MapSlice[T, U any](s *Slice[T], f func(T) U) *Slice[U] {
	out := &Slice[U]{}
	for _, v := range s.items {
		out.Push(f(v))
	}
	return out
}

func main() {
	s := &Slice[int]{}
	s.Push(1)
	s.Push(2)
	s.Push(3)

	labels := MapSlice(s, strconv.Itoa)
	fmt.Printf("%q\n", labels.items)
}
```

```bash
$ go run .

["1" "2" "3"]

--------------------------------------------------------------------------------
Go Version: go1.27rc2
```

So, this code reads backwards, since `MapSlice(s, f)` instead of `s.Map(f)`. The function isn't discoverable from the type, your editor won't suggest it when you type s., and every generic container library in the ecosystem grew a pile of these free-floating helper functions.

## The Fix in Go 1.27

In Go 1.27, a method declaration may declare its own type parameters. Here's the same Map, where it always belonged:

```go
type Slice[T any] struct {
	items []T
}

func (s *Slice[T]) Push(v T) {
	s.items = append(s.items, v)
}

// In Go 1.27, a method can declare its own type parameters.
func (s *Slice[T]) Map[U any](f func(T) U) *Slice[U] {
	out := &Slice[U]{}
	for _, v := range s.items {
		out.Push(f(v))
	}
	return out
}

func main() {
	s := &Slice[int]{}
	s.Push(1)
	s.Push(2)
	s.Push(3)

	// U is inferred as string from strconv.Itoa.
	labels := s.Map(strconv.Itoa)
	fmt.Printf("%q\n", labels.items)

	// Or instantiate it explicitly.
	halves := s.Map[float64](func(i int) float64 { return float64(i) / 2 })
	fmt.Println(halves.items)
}
```

```bash

$ go run .

["1" "2" "3"]
[0.5 1 1.5]

--------------------------------------------------------------------------------
Go Version: go1.27rc2
```

## Chaining Capability

The package level workaround of declaring a function had one drawback, which this can solve that you couldn't chain transformations, would probably had to resort to something like this `MapSlice(FilterSlice(s, keep), transform)`. In the new approach you might do it in the following way:

```go
type Slice[T any] struct {
	items []T
}

func From[T any](items ...T) *Slice[T] {
	return &Slice[T]{items: items}
}

// Keep only doesn't need its own type parameter. This was
// already possible with earlier versions of Go.
func (s *Slice[T]) Keep(f func(T) bool) *Slice[T] {
	out := &Slice[T]{}
	for _, v := range s.items {
		if f(v) {
			out.items = append(out.items, v)
		}
	}
	return out
}

// Map and Reduce introduce U, so before Go 1.27 they could
// not be methods.
func (s *Slice[T]) Map[U any](f func(T) U) *Slice[U] {
	out := &Slice[U]{}
	for _, v := range s.items {
		out.items = append(out.items, f(v))
	}
	return out
}

func (s *Slice[T]) Reduce[U any](initial U, f func(U, T) U) U {
	acc := initial
	for _, v := range s.items {
		acc = f(acc, v)
	}
	return acc
}

type Order struct {
	Item  string
	Total float64
}

func main() {
	orders := From(
		Order{Item: "gopher plush", Total: 24.99},
		Order{Item: "sticker pack", Total: 4.99},
		Order{Item: "go course", Total: 299.00},
		Order{Item: "coffee mug", Total: 14.99},
	)

	receipt := orders.
		Keep(func(o Order) bool { return o.Total >= 10 }).
		Map(func(o Order) string { return o.Item }).
		Reduce("receipt:", func(acc, item string) string {
			return acc + " " + item
		})

	fmt.Println(receipt)

	revenue := orders.
		Map(func(o Order) float64 { return o.Total }).
		Reduce(0.0, func(sum, t float64) float64 { return sum + t })

	fmt.Printf("revenue: %.2f\n", revenue)
}
```

```bash
$ go run .

receipt: gopher plush go course coffee mug
revenue: 343.97

--------------------------------------------------------------------------------
Go Version: go1.27rc2
```

## Restrictions

There is one important restriction: `interfaces` still can’t declare type-parameterized methods, and a generic method can’t be used to satisfy an interface. Put a generic method in an interface and the compiler stops you:

```go
type Mapper interface {
    Map[U any](f func(int) U) any
}
```

```bash
interface method must have no type parameters
```
